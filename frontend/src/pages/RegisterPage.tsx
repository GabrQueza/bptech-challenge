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

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      console.log('✅ Account created successfully!', response.data);
      
      toast({
        title: 'Sucesso',
        description: 'Conta criada com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/login');
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
    <Box minH="100vh" w="100%" bg="gray.50" py={10} px={4}>
      <Container centerContent>
        <Box w="full" maxW="md" p={8} borderRadius="xl" boxShadow="lg" bg="white">
          <VStack spacing={4} align="stretch" as="form" onSubmit={handleRegister}>
            <Heading textAlign="center" size="lg" color="blue.900">Cadastrar</Heading>
          
          <FormControl isRequired>
            <FormLabel>Nome</FormLabel>
            <Input 
              type="text" 
              placeholder="Digite seu nome" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>

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
            Cadastrar
          </Button>
          
          <Text textAlign="center">
            Já tem uma conta?{' '}
            <Link as={RouterLink} to="/login" color="blue.500">
              Entre aqui
            </Link>
          </Text>
        </VStack>
        </Box>
      </Container>
    </Box>
  );
};
