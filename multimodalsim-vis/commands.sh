# start simulation
py -m communication fixed --gtfs --gtfs-folder communication/data/20191101/gtfs/ -r communication/data/20191101/requests.csv  --multimodal --log-level INFO  -g communication/data/20191101/bus_network_graph_20191101.txt --osrm
py -m multimodalsim fixed --gtfs --gtfs-folder ../data/20191101/gtfs/ -r ../data/20191101/requests.csv  --multimodal --log-level INFO  -g ../data/20191101/bus_network_graph_20191101.txt --osrm
docker pull 
# start docker
sudo docker run -it --name activemq --ulimit nofile=122880:122880 -m 3G -p 61616:61616 -p 61614:61614 -p 61613:61613 -p 8161:8161 symptoma/activemq 
docker run -it --name activemq --ulimit nofile=122880:122880 -m 3G -p 61616:61616 -p 61614:61614 -p 61613:61613 -p 8161:8161 symptoma/activemq