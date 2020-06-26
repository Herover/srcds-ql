import { ApolloServer, gql } from 'apollo-server';
import { SourceServer } from 'steam-condenser';
import { ServerArguments, CreateTokenArguments } from './defs';
import { createToken } from './token';

const TIMEOUT = 1000;

/**
 * Do we require server owners intent to use this service?
 * If true, a admin must first set a encrypted token in server tags which we can verify before we
 * attempt to authenticate.
 * This is for avoiding malicious login attempts (bruteforce attacks) which can get our IP blocked.
 */
const RCON_PROOF_REQUIRED = !!process.env.RCON_PROOF_REQUIRED || true;
/** Prefix token value with this */
const RCON_PROOF_PREFIX = process.env.RCON_PROOF_PREFIX || 'rc_';
/** 
 * Append this to rcon password. Not setting this will expose hash of rcon password to the
 * internet and makes it easier to crack the password since it can be done offline.
 */
const RCON_PROOF_SECRET = process.env.RCON_PROOF_SECRET || '';
if (!RCON_PROOF_SECRET) {
  console.warn('WARNING: No RCON_PROOF_SECRET environment variable set');
}

const typeDefs = gql`
  # This "Book" type defines the queryable fields for every book in our data source.
  type SourceServer {
    networkVersion: Int!
    serverName: String!
    mapName: String!
    gameDir: String!
    gameDesc: String!
    appId: Int!
    numberOfPlayers: Int!
    maxPlayers: Int!
    botNumber: Int!
    dedicated: String!
    operatingSystem: String!
    passwordProtected: Boolean!
    secureServer: Boolean!
    gameVersion: String!
    serverPort: Int!
    serverId: Int!
    gameId: Int!
    
    ping: Int!

    "Player list - notice that some servers hosts blocks this"
    players: [SourcePlayer]!

    "Server rules - notice that some server hosts blocks this"
    rules: [KeyValue]!
  }

  type SourcePlayer {
    id: Int!
    name: String!
    score: Int!
    connectTime: Int!
    isExtended: Boolean!
    clientPort: Int
    connectionId: Int
    ipAddress: String
    loss: Int
    ping: Int
    rate: Int
    state: String
    steamId: String
    bot: Boolean
  }

  type KeyValue {
    k: String!
    v: String!
  }

  type Token {
    token: String!
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    server(host: String!, password: String): SourceServer
    createToken(password: String!, host: String!): Token
  }
`;

const resolvers = {
  Query: {
    createToken: async (_: any, { password, host }: CreateTokenArguments) => {
      const token = await createToken({
        password,
        host,
        secret: RCON_PROOF_SECRET
      });
      return { token: RCON_PROOF_PREFIX + token };
    },
    server: async (_: any, { host, password }: ServerArguments) => {
      console.log(host)
      const server = new SourceServer(host);
      server.setTimeout(TIMEOUT);
      await server.initialize()
      if (typeof password === "string" && password !== "") {
        if (RCON_PROOF_REQUIRED) {
          const rules = await server.getRules();
          let tag: string | undefined;
          if (rules['sv_tags'] && (tag = rules['sv_tags'].split(',').find((tag) => tag.startsWith(RCON_PROOF_PREFIX)))) {
            const token = tag.slice(RCON_PROOF_PREFIX.length);
            const expected = await createToken({ host, password, secret: RCON_PROOF_SECRET });
            if (token !== expected) {
              throw new Error('Unable to verify token');
            }
          } else {
            throw new Error('No token found in tags');
          }
        }
        await server.rconAuth(password);
      }

      return {
        ... await server.getServerInfo(),
        async ping() {
          return await server.getPing();
        },
        async players() {
          const players = await server.getPlayers();
          return Object.keys(players).map((playerName) => {
            const player = players[playerName];
            return {
              clientPort: player.getClientPort(),
              connectionId: player.getConnectionId(),
              connectTime: player.getConnectTime(),
              id: player.getId(),
              isExtended: player.isExtended(),
              ipAddress: player.getIpAddress(),
              loss: player.getLoss(),
              name: player.getName(),
              ping: player.getPing(),
              rate: player.getRate(),
              score: player.getScore(),
              state: player.getState(),
              steamId: player.getSteamId(),
              bot: player.isBot(),
            };
          });
        },
        async rules() {
          try {
            const rules = await server.getRules();
            return Object.keys(rules).map((ruleKey) => ({
              k: ruleKey,
              v: rules[ruleKey],
            }));
          }
          catch(e) {
            return [];
          }
        },
      };
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
