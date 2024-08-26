'use client'
import { Box, Stack } from "@mui/system";
import { useState } from "react";
import { Button, TextField } from "@mui/material";

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
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction="column"
        width="500px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={message.role === "assistant" ? "flex-start" : "flex-end"}
            >
              <Box
                bgcolor={message.role === "assistant" ? "#e0e0e0" : "#1976d2"}  // Assistant's background light gray, User's background blue
                color={message.role === "assistant" ? "black" : "white"}  // Assistant's text black, User's text white
                borderRadius={16}
                p={3}
                maxWidth="75%"
                style={{ whiteSpace: 'pre-wrap', color: message.role === 'assistant' ? 'black' : 'white' }} // Ensure text is visible and wraps correctly
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
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
