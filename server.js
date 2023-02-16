const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLScalarType
} = require('graphql');
const { actors, movies} = require('./seedData');

const app = express();

const MovieType = new GraphQLObjectType({
    name: 'Movie',
    description: 'Represents a movie with an actor',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        actorId: {type: GraphQLNonNull(GraphQLInt)},
        actor: {
            type: ActorType,
            resolve: (movie) => {
                return actors.find(actor => actor.id === movie.actorId)
            }
        }
    })
})
const ActorType = new GraphQLObjectType({
    name: 'Actor',
    description: 'Represents a movie with an actor',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        movies: {
            type: new GraphQLList(MovieType),
            resolve: (actor) => {
                return movies.filter(movie => movie.actorId === actor.id)
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        movie: {
            type: MovieType,
            description: 'Single movie',
            args: {
                id: {type: GraphQLInt},
            },
            resolve: (parent, args) => movies.find(movie => movie.id === args.id)
        },
        movies: {
            type: new GraphQLList(MovieType),
            description: 'List of all movies',
            resolve: () => movies
        },
        actor: {
            type: ActorType,
            description: 'Single actor',
            args: {
                id: {type: GraphQLInt},
            },
            resolve: (parent, args) => actors.find(actor => actor.id === args.id)
        },
        actors: {
            type: new GraphQLList(ActorType),
            description: 'List of all actors',
            resolve: () => actors
        },
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addMovie: {
            type: MovieType,
            description: "add a movie",
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                actorId: {type: GraphQLNonNull(GraphQLInt)},
            },
            resolve: (parent, args) => {
                const movie = {
                    id: movies.length + 1,
                    name: args.name,
                    actorId: args.actorId,
                }
                //would interact async with db to add this entry
                //just adding to seed at this point
            
                movies.push(movie)
                return movie
            }
        }
    })
}
)

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
});

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true, //enables graphiql playground interface
}))

app.listen(1337, ()=> {
    console.log('Server is running on Port 1337')
})