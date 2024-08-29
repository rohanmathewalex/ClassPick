'use client';

import { Box, Stack, Button, TextField, Container } from "@mui/material";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi!, I'm the Rate my Professor support assistant. How can I help you today?"
    }
  ]);
  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    const newMessages = [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: '' }
    ];

    setMessages(newMessages);
    setMessage('');

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newMessages),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let result = '';
    await reader.read().then(function processText({ done, value }) {
      if (done) return result;

      const text = decoder.decode(value || new Uint8Array(), { stream: true });
      const updatedMessages = [...newMessages];
      updatedMessages[updatedMessages.length - 1].content += text;

      setMessages(updatedMessages);
      return reader.read().then(processText);
    });
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Stack
          direction="column"
          width="100%"
          border="1px solid #ccc"
          borderRadius={4}
          p={2}
          spacing={3}
          style={{ backgroundColor: '#f5f5f5' }}
        >
          <Stack
            direction="column"
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="500px"
            style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: '4px' }}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={message.role === "assistant" ? "flex-start" : "flex-end"}
              >
                <Box
                  bgcolor={message.role === "assistant" ? "#e0e0e0" : "#1976d2"}
                  color={message.role === "assistant" ? "black" : "white"}
                  borderRadius={16}
                  p={2}
                  maxWidth="75%"
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {message.content}
                </Box>
              </Box>
            ))}
          </Stack>
          <Stack
            direction="row"
            spacing={2}
          >
            <TextField
              label="Type your message"
              variant="outlined"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={sendMessage}
            >
              Send
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Container>
  );
}
