import React, { useEffect, useState } from 'react';
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
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
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

  // Modal State
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [currentReservationId, setCurrentReservationId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    roomId: '',
    date: '',
    startTime: '',
    endTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentReservationId(null);
    setFormData({ roomId: '', date: '', startTime: '', endTime: '' });
    onOpen();
  };

  const handleOpenEdit = (res: any) => {
    setIsEditing(true);
    setCurrentReservationId(res.id);
    
    // Convert backend dates to local time strings
    const dObj = new Date(res.date);
    const sObj = new Date(res.startTime);
    const eObj = new Date(res.endTime);
    
    setFormData({
      roomId: res.roomId,
      date: dObj.toISOString().split('T')[0],
      startTime: sObj.toTimeString().slice(0, 5),
      endTime: eObj.toTimeString().slice(0, 5),
    });
    onOpen();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        roomId: formData.roomId,
        date: new Date(formData.date).toISOString(),
        startTime: new Date(`${formData.date}T${formData.startTime}:00`).toISOString(),
        endTime: new Date(`${formData.date}T${formData.endTime}:00`).toISOString(),
      };

      if (isEditing && currentReservationId) {
        await api.patch(`/reservations/${currentReservationId}`, payload);
        toast({ title: 'Success', description: 'Reservation updated!', status: 'success', duration: 3000, isClosable: true });
      } else {
        await api.post('/reservations', payload);
        toast({ title: 'Success', description: 'Reservation created!', status: 'success', duration: 3000, isClosable: true });
      }
      
      onClose();
      fetchReservations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error saving reservation',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
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
        <HStack>
          <Button colorScheme="green" onClick={handleOpenCreate}>New Reservation</Button>
          <Button colorScheme="red" onClick={handleLogout}>Logout</Button>
        </HStack>
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
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={6} textAlign="center">Loading...</Td>
              </Tr>
            ) : filteredReservations.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center">No reservations found.</Td>
              </Tr>
            ) : (
              filteredReservations.map((res) => (
                <Tr key={res.id}>
                  <Td>{new Date(res.date).toLocaleDateString()}</Td>
                  <Td>{res.roomId}</Td>
                  <Td>{new Date(res.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Td>
                  <Td>{new Date(res.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Td>
                  <Td>{res.user?.name || res.userId}</Td>
                  <Td>
                    <Button size="sm" colorScheme="blue" onClick={() => handleOpenEdit(res)}>
                      Edit
                    </Button>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Modal for Create/Edit */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit}>
          <ModalHeader>{isEditing ? 'Edit Reservation' : 'New Reservation'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Room ID</FormLabel>
                <Input 
                  placeholder="e.g. sala-a" 
                  value={formData.roomId} 
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })} 
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Date</FormLabel>
                <Input 
                  type="date" 
                  value={formData.date} 
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                />
              </FormControl>
              <HStack w="full">
                <FormControl isRequired>
                  <FormLabel>Start Time</FormLabel>
                  <Input 
                    type="time" 
                    value={formData.startTime} 
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} 
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>End Time</FormLabel>
                  <Input 
                    type="time" 
                    value={formData.endTime} 
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} 
                  />
                </FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="blue" type="submit" isLoading={isSubmitting}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Container>
  );
};
