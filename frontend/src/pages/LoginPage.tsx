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
        title: 'Erro',
        description: 'Por favor, preencha todos os campos.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data.access_token;
      localStorage.setItem('access_token', token);
      console.log('✅ Login successful! Token received:', token);
      
      toast({
        title: 'Sucesso',
        description: 'Login realizado com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro de conexão',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={10}>
      <Container centerContent>
        <Box w="full" maxW="md" p={8} borderRadius="lg" boxShadow="md" bg="white">
          <VStack spacing={4} align="stretch" as="form" onSubmit={handleLogin}>
            <Heading textAlign="center" size="lg" color="blue.900">Entrar</Heading>
          
          <FormControl isRequired>
            <FormLabel>E-mail</FormLabel>
            <Input 
              type="email" 
              placeholder="Digite seu e-mail" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Senha</FormLabel>
            <Input 
              type="password" 
              placeholder="Digite sua senha" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          
          <Button 
            colorScheme="blue" 
            size="lg" 
            type="submit" 
            mt={4} 
            isLoading={isLoading}
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
            transition="all 0.2s"
          >
            Entrar
          </Button>
          
          <Text textAlign="center">
            Não tem uma conta?{' '}
            <Link as={RouterLink} to="/register" color="blue.500">
              Registre-se aqui
            </Link>
          </Text>
        </VStack>
        </Box>
      </Container>
    </Box>
  );
};
