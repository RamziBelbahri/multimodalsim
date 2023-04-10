FROM node:latest as node

WORKDIR /backend/communication/server
COPY communication/server/package.json ./
RUN npm install
WORKDIR /backend
COPY . .
RUN apt-get update 

RUN apt-get install -y wget
RUN wget https://www.python.org/ftp/python/3.10.11/Python-3.10.11.tgz && \
    tar -xzvf Python-3.10.11.tgz && \
    cd Python-3.10.11 && \
    ./configure && \
    make && \
    make install && \
    cd .. && \
    rm -rf Python-3.10.11*

RUN apt-get install python3-pip -y
RUN apt-get install -y python-is-python3
RUN apt-get install -y docker.io
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
RUN npm run build
ENV PORT 8000
EXPOSE 8000
CMD [ "npm", "run", "docker" ]
