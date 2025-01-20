import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import TablePagination from '@mui/material/TablePagination';
import { DashboardContent } from 'src/layouts/dashboard';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import type { Feedback } from '../models/firebaseModel';
import { deleteFeedbackFromDb, fetchFeedbacksFromDb } from '../models/firebaseModel';

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  textAlign: 'center',
  borderRadius: '8px',
};

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<keyof Feedback | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<Feedback | null>(null);
  const navigate = useNavigate();

  // useEffect to get feedback from Firebase
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const feedbackList = await fetchFeedbacksFromDb();
        setFeedbacks(feedbackList);
        setFilteredFeedbacks(feedbackList);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
      }
    };

    fetchFeedbacks();
  }, []);

  useEffect(() => {
    const filtered = feedbacks.filter(
      (feedback) =>
        feedback.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.question.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFeedbacks(filtered);
  }, [searchTerm, feedbacks]);

  useEffect(() => {
    const filtered = feedbacks.filter((feedback) => {
      const createdAt = feedback.createdAt?.toDate();
      if (startDate && createdAt && createdAt < new Date(startDate)) {
        return false;
      }
      if (endDate && createdAt && createdAt > new Date(endDate)) {
        return false;
      }
      return true;
    });
    setFilteredFeedbacks(filtered);
  }, [startDate, endDate, feedbacks]);

  const handleSort = (field: keyof Feedback) => {
    const isAsc = sortBy === field && sortDirection === 'asc';
    setSortBy(field);
    setSortDirection(isAsc ? 'desc' : 'asc');
    const sorted = [...filteredFeedbacks].sort((a, b) => {
      if (a[field] < b[field]) return isAsc ? -1 : 1;
      if (a[field] > b[field]) return isAsc ? 1 : -1;
      return 0;
    });
    setFilteredFeedbacks(sorted);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAdd = () => {
    navigate('/add-feedback');
  };

  const handleUpdate = (id: string) => {
    navigate(`/update-feedback/${id}`);
  };

  const handleDelete = async () => {
    if (selectedFeedbackId) {
      try {
        await deleteFeedbackFromDb(selectedFeedbackId);
        setFeedbacks((prevFeedbacks) =>
          prevFeedbacks.filter((feedback) => feedback.id !== selectedFeedbackId)
        );
        toast.success('Feedback successfully deleted!');
      } catch (error) {
        console.error('Error deleting feedback:', error);
        toast.error('Error deleting feedback. Please try again.');
      } finally {
        setIsDeleteModalOpen(false);
        setSelectedFeedbackId(null);
      }
    }
  };

  const openDeleteModal = (id: string) => {
    setSelectedFeedbackId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedFeedbackId(null);
  };

  const openDetailsModal = (feedback: Feedback) => {
    setSelectedDetails(feedback);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedDetails(null);
  };

  const csvHeaders = [
    { label: 'Name', key: 'name' },
    { label: 'Email', key: 'email' },
    { label: 'Question', key: 'question' },
    { label: 'Description', key: 'description' },
    { label: 'Option 1', key: 'option1' },
    { label: 'Option 2', key: 'option2' },
    { label: 'Option 3', key: 'option3' },
    { label: 'Option 4', key: 'option4' },
    { label: 'Created At', key: 'createdAt' },
    { label: 'Updated At', key: 'updatedAt' },
  ];

  const paginatedFeedbacks = filteredFeedbacks.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Feedbacks
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} sm={6} md={2}>
            <Button
              variant="contained"
              onClick={handleAdd}
              fullWidth // Makes the button take the full width on smaller screens
            >
              Add Feedback
            </Button>
          </Grid>
          <Grid xs={12} sm={6} md={4}>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              fullWidth // Adapts to screen size
            />
          </Grid>
          <Grid xs={12} sm={6} md={2}>
            <TextField
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth // Adapts to screen size
            />
          </Grid>
          <Grid xs={12} sm={6} md={2}>
            <TextField
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth // Adapts to screen size
            />
          </Grid>
          <Grid xs={12} md={2}>
            <CSVLink
              data={feedbacks}
              headers={csvHeaders}
              filename="feedbacks.csv"
              className="btn btn-primary"
            >
              <Button variant="outlined" fullWidth>
                Download CSV
              </Button>
            </CSVLink>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        <Grid xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    'name',
                    'email',
                    'question',
                    'description',
                    'option1',
                    'option2',
                    'option3',
                    'option4',
                    'Votes',
                  ].map((field) => (
                    <TableCell key={field}>
                      <TableSortLabel
                        active={sortBy === field}
                        direction={sortDirection}
                        onClick={() => handleSort(field as keyof Feedback)}
                      >
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedFeedbacks.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell>{feedback.name}</TableCell>
                    <TableCell>{feedback.email}</TableCell>
                    <TableCell>{feedback.question}</TableCell>
                    <TableCell>
                      <Box
                        dangerouslySetInnerHTML={{ __html: feedback.description }}
                        sx={{
                          maxWidth: '200px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      />
                    </TableCell>
                    <TableCell>{feedback.option1}</TableCell>
                    <TableCell>{feedback.option2}</TableCell>
                    <TableCell>{feedback.option3}</TableCell>
                    <TableCell>{feedback.option4}</TableCell>
                    <TableCell>{feedback.votes?.length}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => openDetailsModal(feedback)}
                      >
                        Votes
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => handleUpdate(feedback.id)}
                      >
                        Update
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => openDeleteModal(feedback.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredFeedbacks.length}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Grid>
      </Grid>

      {/* Delete Modal */}
      <Modal
        open={isDeleteModalOpen}
        onClose={closeDeleteModal}
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="delete-modal-title" variant="h6">
            Are you sure?
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="contained" color="error" onClick={handleDelete}>
              Yes
            </Button>
            <Button variant="outlined" onClick={closeDeleteModal}>
              No
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal to View Votes */}
      <Modal open={isDetailsModalOpen} onClose={closeDetailsModal}>
        <Box sx={{ ...modalStyle, width: 500 }}>
          <Typography variant="h6">Votes</Typography>
          {selectedDetails?.votes.map((vote, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography>
                <strong>Name:</strong> {vote.voterName}
              </Typography>
              <Typography>
                <strong>Selected Option:</strong> {vote.selectedOption}
              </Typography>
            </Box>
          ))}
          <Button variant="outlined" onClick={closeDetailsModal} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </DashboardContent>
  );
}
