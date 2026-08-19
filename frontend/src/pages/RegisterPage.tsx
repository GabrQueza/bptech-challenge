import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  useToast,
  Container,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Simulate register for now
    console.log('Register with', { name, email, password });
    toast({
      title: 'Success',
      description: 'Account created successfully!',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    navigate('/login');
  };

  return (
    <Container centerContent py={10}>
      <Box w="full" maxW="md" p={8} borderWidth={1} borderRadius="lg" boxShadow="lg">
        <VStack spacing={4} align="stretch" as="form" onSubmit={handleRegister}>
          <Heading textAlign="center" size="lg">Register</Heading>
          
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input 
              type="text" 
              placeholder="Enter your name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input 
              type="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          
          <Button colorScheme="blue" size="lg" type="submit" mt={4}>
            Sign Up
          </Button>
          
          <Text textAlign="center">
            Already have an account?{' '}
            <Link as={RouterLink} to="/login" color="blue.500">
              Login here
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};
