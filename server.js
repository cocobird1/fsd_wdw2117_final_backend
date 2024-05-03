const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB setup
const uri = "mongodb+srv://wdw2117:Bluebird112!@footballtracker.ejunar3.mongodb.net/";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
async function connectMongo() {
    try {
        await client.connect();
        console.log("MongoDB connected");
        return client.db("Pokemon");
    } catch (e) {
        console.error("Could not connect to MongoDB", e);
        process.exit(1);
    }
}

const databasePromise = connectMongo();

// Routes
app.get('/pokemon', async (req, res) => {
    try {
        const database = await databasePromise;
        const pokemons = database.collection("Pokemon");
        const results = await pokemons.find({}).toArray();
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/pokemon/:number', async (req, res) => {
    try {
        const database = await databasePromise;
        const pokemons = database.collection("Pokemon");
        const pokemon = await pokemons.findOne({ Number: parseInt(req.params.number) });
        if (!pokemon) {
            return res.status(404).json({ message: "Pokemon not found" });
        }
        res.json(pokemon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/featured', async (req, res) => {
  const featuredNames = ["Pikachu", "Charizard", "Bulbasaur", "Chansey", "Mew"];

  try {
      const database = await databasePromise;
      const pokemons = database.collection("Pokemon");
      const featuredPokemons = await pokemons.find({ Pokemon: { $in: featuredNames }}).toArray();
      res.json(featuredPokemons);
  } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured Pokémon", error: error.message });
  }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle closing
process.on('SIGINT', async () => {
    await client.close();
    process.exit(0);
});
