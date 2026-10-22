# short introduction of url-shortener
A full-stack URL shortener with click tracking, built with Node.js, Express and MongoDB Atlas.

# URL Shortener

A simple full-stack URL shortener built with **Node.js, Express and MongoDB Atlas**.
Paste a long link, get a short one, and track how many times it has been opened.

The project includes a REST API for creating and resolving short links, a click counter
for every link, a stats endpoint, and a lightweight web interface served by the same
Express server. Links are stored in MongoDB Atlas, so they remain available after the
server restarts.