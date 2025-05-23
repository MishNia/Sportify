package websocket

import (
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Client struct {
	conn     *websocket.Conn
	eventID  int64
	userID   int64
	username string
}

type Message struct {
	EventID   int64  `json:"eventId"`
	UserID    int64  `json:"userId"`
	Username  string `json:"username"`
	Content   string `json:"content"`
	Timestamp string `json:"timestamp"`
}

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan Message
	register   chan *Client
	unregister chan *Client
	mu         sync.Mutex
	messages   map[int64][]Message
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan Message),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		messages:   make(map[int64][]Message),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()

			h.mu.Lock()
			if messages, ok := h.messages[client.eventID]; ok {
				for _, msg := range messages {
					client.conn.WriteJSON(msg)
				}
			}
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				client.conn.Close()
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			h.mu.Lock()
			h.messages[message.EventID] = append(h.messages[message.EventID], message)

			for client := range h.clients {
				if client.eventID == message.EventID {
					err := client.conn.WriteJSON(message)
					if err != nil {
						log.Printf("error: %v", err)
						client.conn.Close()
						delete(h.clients, client)
					}
				}
			}
			h.mu.Unlock()
		}
	}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func (h *Hub) HandleWebSocket(conn *websocket.Conn, eventID int64, userID int64, username string) {
	client := &Client{
		conn:     conn,
		eventID:  eventID,
		userID:   userID,
		username: username,
	}

	h.register <- client

	defer func() {
		h.unregister <- client
	}()

	for {
		var msg Message
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Printf("error: %v", err)
			break
		}

		msg.EventID = eventID
		msg.UserID = userID
		msg.Username = username
		msg.Timestamp = time.Now().Format(time.RFC3339)

		h.broadcast <- msg
	}
}
