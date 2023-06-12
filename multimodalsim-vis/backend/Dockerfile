FROM node:latest as node

WORKDIR /backend/communication/server
COPY communication/server/package.json ./
RUN npm install
WORKDIR /backend
COPY . .
RUN apt-get update || : && apt-get install python3 -y
RUN apt install python3-pip -y
RUN apt install python-is-python3
RUN apt-get install docker.io -y
RUN pip install virtualenv
RUN su
RUN virtualenv venv
RUN chmod +x venv/bin/activate
RUN venv/bin/activate
WORKDIR /backend/multimodal-simulator/python
RUN python -m setup install
RUN pip install stomp.py
RUN pip install networkx==2.8.8
WORKDIR /backend/communication/server
RUN npm i @types/node
RUN npm run build
ENV PORT 8000
EXPOSE 8000
CMD [ "npm", "run", "start" ]
# CMD while true; do sleep 1000; done

