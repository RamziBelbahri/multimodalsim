from stomp import Connection11

class ActiveMQController:
	def __init__(self) -> None:
		pass
	
	def getConnection(user='admin',password='admin',host='0.0.0.0',port=61613):
		conn = Connection11([(host, port)])  
		conn.connect(user, password)
		return conn

if __name__ == '__main__':
	a = ActiveMQController().getConnection()
	a.send("test", "queue/server")