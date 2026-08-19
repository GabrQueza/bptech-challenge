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
import { api } from '../services/api';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('access_token', response.data.access_token);
      toast({
        title: 'Success',
        description: 'Logged in successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to login',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container centerContent py={10}>
      <Box w="full" maxW="md" p={8} borderWidth={1} borderRadius="lg" boxShadow="lg">
        <VStack spacing={4} align="stretch" as="form" onSubmit={handleLogin}>
          <Heading textAlign="center" size="lg">Login</Heading>
          
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
          
          <Button colorScheme="blue" size="lg" type="submit" mt={4} isLoading={isLoading}>
            Sign In
          </Button>
          
          <Text textAlign="center">
            Don't have an account?{' '}
            <Link as={RouterLink} to="/register" color="blue.500">
              Register here
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};
