import { ApolloServer, gql } from 'apollo-server';
import { SourceServer } from '../../steam-condenser-js';
import { ServerArguments } from './defs';

const TIMEOUT = 1000;

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

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    server(host: String!, password: String): SourceServer
  }
`;

const resolvers = {
  Query: {
    server: async (_: any, { host, password }: ServerArguments) => {
      console.log(host)
      const server = new SourceServer(host);
      server.setTimeout(TIMEOUT);
      await server.initialize()
      if (typeof password != "undefined" && password !== "") {
        server.rconAuth(password);
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
