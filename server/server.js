import express from "express";
import cors from "cors";
import mongodb from "mongodb";
import cookieParser from "cookie-parser";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as cheerio from "cheerio";
import unirest from "unirest";
import { nanoid } from "nanoid";

const port = 5000;

const app = express();
const secret = "qwerty";

app.use(cors({ credentials: true, origin: "http://localhost:4173" }));
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

const mongoClient = new mongodb.MongoClient("mongodb://localhost:27017/");
let usersColl;
let sightsColl;

async function connectToMongo() {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("photos-sights-v1");
    usersColl = db.collection("users");
    sightsColl = db.collection("sights");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
}

app.get("/api/users", async (req, res) => {
  if (!usersColl) {
    res.status(500).json({ error: "Database not connected" });
    return;
  }

  try {
    const users = await usersColl.find().toArray();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/users", async (req, res) => {
  const { name, password, isModer } = req.body;

  if (!usersColl) {
    return res.status(500).json({ error: "Database not connected" });
  }

  if (!name || !password) {
    return res.status(400).json({ error: "Требуется ввести имя и пароль" });
  }

  try {
    const existingUser = await usersColl.findOne({ name: name.toLowerCase().trim() });

    if (existingUser) {
      return res.status(400).json({ error: "Пользователь уже существует" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await usersColl.insertOne({
      name,
      password: hashedPassword,
      isModer,
    });
    res.status(201).json({ message: "Регистрация прошла успешно" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { name, password } = req.body;

  if (!usersColl) {
    return res.status(500).json({ error: "Database not connected" });
  }

  if (!name || !password) {
    return res.status(400).json({ error: "Требуется ввести имя и пароль" });
  }

  try {
    const user = await usersColl.findOne({ name: name.trim() });

    if (!user) {
      return res.status(401).json({ error: "Пользователь не найден" });
    }

    if (!bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: "Неверный пароль" });
    }

    const token = jwt.sign({ userId: user._id }, secret);

    res.cookie("token", token, {
      httpOnly: false,
      secure: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.json({ user: user, message: "Удачная авторизация" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Успешный выход из системы" });
});

app.get("/api/current-user", async (req, res) => {
  const { token } = req.cookies;

  if (token) {
    try {
      const decoded = jwt.verify(token, secret);

      const userId = decoded.userId;
      const user = await usersColl.findOne({ _id: new ObjectId(userId) });

      if (!userId) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
});

app.get("/api/users/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!usersColl) {
    return res.status(500).json({ error: "Database not connected" });
  }

  try {
    const user = await usersColl.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*-----------------
      SIGHTS
  -----------------*/
const getData = async () => {
  try {
    const response = await unirest.get("https://www.vsedostoprimechatelnosti.ru/dostoprimechatelnosti.html");
    const $ = cheerio.load(response.body);
    const parsedLinks = [];

    const links = $("a[class='image']").toArray();

    links.forEach((link) => {
      parsedLinks.push(link.attribs.href);
    });

    return parsedLinks.slice(0, 9);
  } catch (e) {
    console.log(e);
    return null;
  }
};

const getParsedData = async () => {
  try {
    const links = await getData();

    links.forEach(async (link) => {
      const response = await unirest.get("https://www.vsedostoprimechatelnosti.ru/" + link);
      const $ = cheerio.load(response.body);

      const title = $("section[id='banner'] h1").text().trim();
      const images = [];
      $("span[class='image main']").each(function () {
        const src = $(this).find("img").attr("src");
        images.push({
          id: nanoid(),
          src: "https://www.vsedostoprimechatelnosti.ru/" + src,
          comments: [],
          reactions: { likes: [], dislikes: [] },
        });
      });

      sightsColl.insertOne({
        name: title,
        country: "",
        city: "",
        date: "",
        images: images,
        author: { _id: "6720eee0dd333100cd68e950", name: "system" },
      });
    });
  } catch (e) {
    console.log(e);
  }
};

app.get("/api/sights", async (req, res) => {
  if (!sightsColl) {
    return res.status(500).json({ error: "Database not connected" });
  }

  try {
    const sights = await sightsColl.find().toArray();

    if (sights.length === 0) {
      getParsedData();
    }

    res.json(sights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/sights", async (req, res) => {
  const { name, country, city, date, images, author } = req.body;

  if (!sightsColl) {
    return res.status(500).json({ error: "Database not connected" });
  }

  if (!name || !country || !city || !date || images.length === 0) {
    return res.status(400).json({ error: "Необходимо заполнить все поля" });
  }

  try {
    const newSight = { name, country, city, date, images, author };
    await sightsColl.insertOne(newSight);
    res.status(201).json({ sight: newSight, message: "Успешная загрузка фотографий" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/sights/:sightId/images/:imageId/comments", async (req, res) => {
  const { sightId, imageId } = req.params;
  const { id, userId, date, userName, comment, answer } = req.body;

  if (!sightsColl) {
    return res.status(500).json({ error: "Database not connected" });
  }

  if (!comment) {
    return res.status(400).json({ error: "Необходимо заполнить все поля" });
  }

  try {
    const sight = await sightsColl.findOne({ _id: new ObjectId(sightId) });
    if (!sight) {
      return res.status(404).json({ error: "Sight not found" });
    }

    if (sight.author._id === userId) {
      return res.status(403).json({ error: "Вы не можете комментировать свою фотографию" });
    }

    const newComment = { id, userId, date, userName, comment, answer };

    await sightsColl.updateOne(
      { _id: new ObjectId(sightId), "images.id": imageId },
      { $push: { "images.$.comments": newComment } }
    );
    res.status(201).json({ comment: newComment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/sights/:sightId/images/:imageId/comments/:commentId", async (req, res) => {
  const { commentId, sightId, imageId } = req.params;
  const { answer } = req.body;

  if (!sightsColl) {
    return res.status(500).json({ error: "Database not connected" });
  }

  try {
    const sight = await sightsColl.findOne({ _id: new ObjectId(sightId) });
    if (!sight) {
      return res.status(404).json({ error: "Sight not found" });
    }

    await sightsColl.updateOne(
      { _id: new ObjectId(sightId), "images.id": imageId },
      { $set: { "images.$.comments.$[comment].answer": answer } },
      { arrayFilters: [{ "comment.id": commentId }] }
    );

    res.status(201).json({ comment: answer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/sights/:sightId/images/:imageId/reactions", async (req, res) => {
  const { sightId, imageId } = req.params;
  const { userId, reaction } = req.body;

  if (!sightsColl) {
    return res.status(500).json({ error: "Database not connected" });
  }

  try {
    const sight = await sightsColl.findOne({ _id: new ObjectId(sightId) });
    if (!sight) {
      return res.status(404).json({ error: "Sight not found" });
    }

    if (!userId) {
      return res.status(400).json({ error: "Пользователь не найден" });
    }

    if (sight.author._id === userId) {
      return res.status(403).json({ error: "Вы не можете реагировать на свою фотографию" });
    }

    if (
      sight.images.find((image) => image.id === imageId).reactions.likes.find((like) => like === userId) ||
      sight.images.find((image) => image.id === imageId).reactions.dislikes.find((dislike) => dislike === userId)
    ) {
      return res.status(403).json({ error: "Вы уже реагировали на эту фотографию" });
    }

    await sightsColl.updateOne(
      { _id: new ObjectId(sightId), "images.id": imageId },
      reaction === "like"
        ? { $push: { "images.$.reactions.likes": userId } }
        : { $push: { "images.$.reactions.dislikes": userId } }
    );

    res.status(201).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/sights/:sightId", async (req, res) => {
  const { sightId } = req.params;
  const { name, country, city, date, images, author } = req.body;

  if (!sightsColl) {
    return res.status(500).json({ error: "Database not connected" });
  }

  try {
    const sight = await sightsColl.findOne({ _id: new ObjectId(sightId) });
    if (!sight) {
      return res.status(404).json({ error: "Sight not found" });
    }

    await sightsColl.updateOne({ _id: new ObjectId(sightId) }, { $set: { name, country, city, date, images, author } });

    res.status(201).json({
      sight: { _id: sightId, name, country, city, date, images, author },
      message: "Успешное обновление",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/sights/:sightId", async (req, res) => {
  const { sightId } = req.params;

  if (!sightsColl) {
    return res.status(500).json({ error: "Database not connected" });
  }

  try {
    const sight = await sightsColl.findOne({ _id: new ObjectId(sightId) });
    if (!sight) {
      return res.status(404).json({ error: "Sight not found" });
    }

    await sightsColl.deleteOne({ _id: new ObjectId(sightId) });

    res.status(201).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  connectToMongo();
  console.log(`server running on http://localhost:${port}`);
});
