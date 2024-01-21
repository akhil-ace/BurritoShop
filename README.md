docker pull mongo:latest
docker run -d --name mongodb -p 27017:27017 mongo
docker ps
docker exec –it mongodb mongosh
db.runCommand({hello:1})
