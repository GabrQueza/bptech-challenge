import { useEffect, useState, useRef } from 'react';
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
  Stack,
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
  Select,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

const pad = (n: number) => n.toString().padStart(2, '0');
const toLocalYYYYMMDD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

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

  // Delete Dialog State
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [reservationToDelete, setReservationToDelete] = useState<string | null>(null);

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/reservations');
      setReservations(response.data);
    } catch (error) {
      toast({
        title: 'Erro ao buscar reservas',
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
    
    // Convert backend dates to local time strings safely
    const dObj = new Date(res.date);
    const sObj = new Date(res.startTime);
    const eObj = new Date(res.endTime);
    
    setFormData({
      roomId: res.roomId,
      date: toLocalYYYYMMDD(dObj),
      startTime: `${pad(sObj.getHours())}:${pad(sObj.getMinutes())}`,
      endTime: `${pad(eObj.getHours())}:${pad(eObj.getMinutes())}`,
    });
    onOpen();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        roomId: formData.roomId,
        date: new Date(`${formData.date}T00:00:00`).toISOString(),
        startTime: new Date(`${formData.date}T${formData.startTime}:00`).toISOString(),
        endTime: new Date(`${formData.date}T${formData.endTime}:00`).toISOString(),
      };

      if (isEditing && currentReservationId) {
        await api.patch(`/reservations/${currentReservationId}`, payload);
        toast({ title: 'Sucesso', description: 'Reserva atualizada com sucesso!', status: 'success', duration: 3000, isClosable: true });
      } else {
        await api.post('/reservations', payload);
        toast({ title: 'Sucesso', description: 'Reserva criada com sucesso!', status: 'success', duration: 3000, isClosable: true });
      }
      
      onClose();
      fetchReservations();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao salvar reserva',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id: string) => {
    setReservationToDelete(id);
    onDeleteOpen();
  };

  const executeDelete = async () => {
    if (!reservationToDelete) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/reservations/${reservationToDelete}`);
      toast({ title: 'Sucesso', description: 'Reserva cancelada com sucesso!', status: 'success', duration: 3000, isClosable: true });
      fetchReservations();
      onDeleteClose();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao excluir reserva',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
      setReservationToDelete(null);
    }
  };

  const filteredReservations = reservations.filter((res) => {
    const localDateStr = toLocalYYYYMMDD(new Date(res.date)); 
    const matchDate = filterDate ? localDateStr === filterDate : true;
    
    const safeRoomId = res.roomId ? String(res.roomId).toLowerCase() : '';
    const matchRoom = filterRoom ? safeRoomId === filterRoom.toLowerCase() : true;
    
    const safeUserName = res.user?.name ? String(res.user.name).toLowerCase() : String(res.userId || '').toLowerCase();
    const matchUser = filterUser ? safeUserName.includes(filterUser.toLowerCase()) : true;
    
    return matchDate && matchRoom && matchUser;
  });

  const handleResetFilters = () => {
    setFilterDate('');
    setFilterRoom('');
    setFilterUser('');
  };

  return (
    <Box minH="100vh" bg="gray.50" py={10}>
      <Container maxW="container.xl">
        <Flex direction={{ base: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={8} gap={{ base: 4, md: 0 }}>
          <Heading color="blue.900" textAlign={{ base: 'center', md: 'left' }}>Painel de Reservas</Heading>
        <HStack w={{ base: '100%', md: 'auto' }} justifyContent={{ base: 'center', md: 'flex-start' }}>
          <Button 
            colorScheme="green" 
            onClick={handleOpenCreate}
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
            transition="all 0.2s"
          >
            Nova Reserva
          </Button>
          <Button 
            colorScheme="red" 
            onClick={handleLogout}
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
            transition="all 0.2s"
          >
            Sair
          </Button>
        </HStack>
      </Flex>

      <Box p={6} borderRadius="xl" boxShadow="lg" bg="white" mb={6}>
        <VStack align="stretch" spacing={4}>
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontWeight="bold" color="gray.700">Filtros</Text>
            <Button 
              size="sm" 
              onClick={handleResetFilters}
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
              transition="all 0.2s"
            >
              Limpar Filtros
            </Button>
          </Flex>
          <Stack direction={{ base: 'column', md: 'row' }} spacing={4} w="100%">
            <Input 
              type="date" 
              placeholder="Filtrar por Data" 
              value={filterDate} 
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <Select 
              placeholder="Selecionar Sala" 
              value={filterRoom} 
              onChange={(e) => setFilterRoom(e.target.value)}
            >
              <option value="sala-a">sala-a</option>
              <option value="sala-b">sala-b</option>
              <option value="sala-c">sala-c</option>
            </Select>
            <Input 
              placeholder="Filtrar por Nome de Usuário" 
              value={filterUser} 
              onChange={(e) => setFilterUser(e.target.value)}
            />
          </Stack>
        </VStack>
      </Box>

      <Box overflowX="auto" w="100%" borderRadius="xl" boxShadow="lg" bg="white" p={6}>
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Data</Th>
              <Th>Sala</Th>
              <Th>Início</Th>
              <Th>Término</Th>
              <Th>Usuário</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={6} textAlign="center">Carregando...</Td>
              </Tr>
            ) : filteredReservations.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center">Nenhuma reserva encontrada.</Td>
              </Tr>
            ) : (
              filteredReservations.map((res) => (
                <Tr key={res.id}>
                  <Td>{new Date(res.date).toLocaleDateString('pt-BR')}</Td>
                  <Td>{res.roomId}</Td>
                  <Td>{new Date(res.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Td>
                  <Td>{new Date(res.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Td>
                  <Td>{res.user?.name || res.userId}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button 
                        size="sm" 
                        colorScheme="blue" 
                        onClick={() => handleOpenEdit(res)}
                        _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                        transition="all 0.2s"
                      >
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        colorScheme="red" 
                        onClick={() => confirmDelete(res.id)}
                        _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                        transition="all 0.2s"
                      >
                        Excluir
                      </Button>
                    </HStack>
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
          <ModalHeader>{isEditing ? 'Editar Reserva' : 'Nova Reserva'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Sala</FormLabel>
                <Select 
                  placeholder="Selecione uma sala" 
                  value={formData.roomId} 
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                >
                  <option value="sala-a">sala-a</option>
                  <option value="sala-b">sala-b</option>
                  <option value="sala-c">sala-c</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Data</FormLabel>
                <Input 
                  type="date" 
                  value={formData.date} 
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                />
              </FormControl>
              <HStack w="full">
                <FormControl isRequired>
                  <FormLabel>Horário de Início</FormLabel>
                  <Input 
                    type="time" 
                    value={formData.startTime} 
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} 
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Horário de Término</FormLabel>
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
            <Button variant="ghost" mr={3} onClick={onClose} _hover={{ bg: 'gray.100' }}>
              Cancelar
            </Button>
            <Button 
              colorScheme="blue" 
              type="submit" 
              isLoading={isSubmitting}
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
              transition="all 0.2s"
            >
              Salvar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Alert Dialog for Delete Confirmation */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Cancelar Reserva
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza? Esta ação não pode ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose} _hover={{ bg: 'gray.100' }}>
                Não, manter
              </Button>
              <Button 
                colorScheme="red" 
                onClick={executeDelete} 
                ml={3} 
                isLoading={isSubmitting}
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                transition="all 0.2s"
              >
                Sim, cancelar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      </Container>
    </Box>
  );
};
