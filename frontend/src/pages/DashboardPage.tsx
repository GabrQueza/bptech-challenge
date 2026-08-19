import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Input,
  VStack,
  Button,
  useToast,
  Text,
  Flex
} from '@chakra-ui/react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filterDate, setFilterDate] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [filterUser, setFilterUser] = useState('');

  const toast = useToast();
  const navigate = useNavigate();

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/reservations');
      setReservations(response.data);
    } catch (error) {
      toast({
        title: 'Error fetching reservations',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const filteredReservations = reservations.filter((res) => {
    const matchDate = filterDate ? res.date.startsWith(filterDate) : true;
    const matchRoom = filterRoom ? res.roomId.toLowerCase().includes(filterRoom.toLowerCase()) : true;
    const matchUser = filterUser ? res.user?.name.toLowerCase().includes(filterUser.toLowerCase()) : true;
    return matchDate && matchRoom && matchUser;
  });

  return (
    <Container maxW="container.xl" py={10}>
      <Flex justifyContent="space-between" alignItems="center" mb={8}>
        <Heading>Reservations Dashboard</Heading>
        <Button colorScheme="red" onClick={handleLogout}>Logout</Button>
      </Flex>

      <Box p={6} borderWidth={1} borderRadius="lg" boxShadow="md" bg="white" mb={6}>
        <VStack align="stretch" spacing={4}>
          <Text fontWeight="bold">Filters</Text>
          <HStack spacing={4}>
            <Input 
              type="date" 
              placeholder="Filter by Date" 
              value={filterDate} 
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <Input 
              placeholder="Filter by Room ID" 
              value={filterRoom} 
              onChange={(e) => setFilterRoom(e.target.value)}
            />
            <Input 
              placeholder="Filter by User Name" 
              value={filterUser} 
              onChange={(e) => setFilterUser(e.target.value)}
            />
          </HStack>
        </VStack>
      </Box>

      <Box overflowX="auto" borderWidth={1} borderRadius="lg" boxShadow="md" bg="white">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Date</Th>
              <Th>Room</Th>
              <Th>Start Time</Th>
              <Th>End Time</Th>
              <Th>User</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={5} textAlign="center">Loading...</Td>
              </Tr>
            ) : filteredReservations.length === 0 ? (
              <Tr>
                <Td colSpan={5} textAlign="center">No reservations found.</Td>
              </Tr>
            ) : (
              filteredReservations.map((res) => (
                <Tr key={res.id}>
                  <Td>{new Date(res.date).toLocaleDateString()}</Td>
                  <Td>{res.roomId}</Td>
                  <Td>{new Date(res.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Td>
                  <Td>{new Date(res.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Td>
                  <Td>{res.user?.name || res.userId}</Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
    </Container>
  );
};
