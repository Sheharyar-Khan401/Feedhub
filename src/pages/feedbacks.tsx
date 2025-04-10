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
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { DashboardContent } from 'src/layouts/dashboard';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import type { Feedback } from '../models/firebaseModel';
import { deleteFeedbackFromDb, fetchFeedbacksFromDb } from '../models/firebaseModel';
import { useAuth } from '../contexts/auth-context';

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  textAlign: 'center',
  borderRadius: '8px',
};

// Add this type definition before the FeedbackVisualization component
type TooltipData = {
  option: string;
  count: number;
  percentage: string;
};

// Add this new component for visualizations
const FeedbackVisualization = ({ feedback }: { feedback: Feedback }) => {
  if (!feedback.votes || feedback.votes.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No votes yet
        </Typography>
      </Box>
    );
  }

  if (feedback.questionType === 'multiple-choice') {
    // Count votes for each option
    const voteCounts = feedback.votes.reduce((acc: Record<string, number>, vote) => {
      if (vote.selectedOption) {
        const option = vote.selectedOption;
        acc[option] = (acc[option] || 0) + 1;
      }
      return acc;
    }, {});

    const data = Object.entries(voteCounts).map(([option, count]) => ({
      option,
      count
    }));

    // Find the most selected option
    const mostSelected = data.reduce((max, current) => 
      current.count > max.count ? current : max, data[0]
    );

    // Calculate percentage for each option
    const totalVotes = data.reduce((sum, item) => sum + item.count, 0);
    const dataWithPercentage = data.map(item => ({
      ...item,
      percentage: ((item.count / totalVotes) * 100).toFixed(1)
    }));

    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Response Analysis
        </Typography>
        <Typography variant="body1" color="primary" sx={{ mb: 2 }}>
          Most selected option: <strong>{mostSelected.option}</strong> ({mostSelected.count} votes, {((mostSelected.count / totalVotes) * 100).toFixed(1)}%)
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataWithPercentage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="option" />
              <YAxis />
              <RechartsTooltip 
                formatter={(value: number, name: string, item?: { payload?: TooltipData }) => [
                  `${value} votes (${item?.payload?.percentage || '0'}%)`,
                  'Count'
                ]}
              />
              <Legend />
              <Bar 
                dataKey="count" 
                fill="#8884d8"
                label={{ position: 'top' }}
              >
                {dataWithPercentage.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.option === mostSelected.option ? '#1976d2' : '#8884d8'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    );
  }

  if (feedback.questionType === 'rating') {
    // Count votes for each rating
    const voteCounts = feedback.votes.reduce((acc: Record<string, number>, vote) => {
      if (typeof vote.rating === 'number') {
        const rating = vote.rating.toString();
        acc[rating] = (acc[rating] || 0) + 1;
      }
      return acc;
    }, {});

    const data = Object.entries(voteCounts).map(([rating, count]) => ({
      rating: `Rating ${rating}`,
      count
    }));

    // Calculate average rating
    const totalVotes = data.reduce((sum, item) => sum + item.count, 0);
    const sumRatings = data.reduce((sum, item) => 
      sum + (parseInt(item.rating.split(' ')[1], 10) * item.count), 0
    );
    const averageRating = (sumRatings / totalVotes).toFixed(1);

    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Response Analysis
        </Typography>
        <Typography variant="body1" color="primary" sx={{ mb: 2 }}>
          Average Rating: <strong>{averageRating}</strong> out of {feedback.ratingScale?.max || 5}
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    );
  }

  return null;
};

export default function Feedbacks() {
  const [createdFeedbacks, setCreatedFeedbacks] = useState<Feedback[]>([]);
  const [votedFeedbacks, setVotedFeedbacks] = useState<Feedback[]>([]);
  const [activeTab, setActiveTab] = useState(0);
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
  const { user } = useAuth();

  // useEffect to get feedback from Firebase
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        if (!user) {
          toast.error('You must be logged in to view feedbacks');
          navigate('/login');
          return;
        }
        const { createdFeedbacks: fetchedCreated, votedFeedbacks: fetchedVoted } = await fetchFeedbacksFromDb(user.uid);
        setCreatedFeedbacks(fetchedCreated);
        setVotedFeedbacks(fetchedVoted);
        setFilteredFeedbacks(fetchedCreated);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
        toast.error('Error fetching feedbacks. Please try again.');
      }
    };

    fetchFeedbacks();
  }, [user, navigate]);

  useEffect(() => {
    const currentFeedbacks = activeTab === 0 ? createdFeedbacks : votedFeedbacks;
    const filtered = currentFeedbacks.filter(
      (feedback) =>
        feedback.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.question.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFeedbacks(filtered);
  }, [searchTerm, createdFeedbacks, votedFeedbacks, activeTab]);

  useEffect(() => {
    const currentFeedbacks = activeTab === 0 ? createdFeedbacks : votedFeedbacks;
    const filtered = currentFeedbacks.filter((feedback) => {
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
  }, [startDate, endDate, createdFeedbacks, votedFeedbacks, activeTab]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setFilteredFeedbacks(newValue === 0 ? createdFeedbacks : votedFeedbacks);
    setPage(0);
  };

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
    if (selectedFeedbackId && user) {
      try {
        await deleteFeedbackFromDb(selectedFeedbackId, user.uid);
        setFilteredFeedbacks((prevFeedbacks) =>
          prevFeedbacks.filter((feedback) => feedback.id !== selectedFeedbackId)
        );
        toast.success('Feedback successfully deleted!');
      } catch (error: any) {
        console.error('Error deleting feedback:', error);
        toast.error(error.message || 'Error deleting feedback. Please try again.');
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
    { label: 'Question Type', key: 'questionType' },
    { label: 'Option 1', key: 'options.option1' },
    { label: 'Option 2', key: 'options.option2' },
    { label: 'Option 3', key: 'options.option3' },
    { label: 'Option 4', key: 'options.option4' },
    { label: 'Rating Min', key: 'ratingScale.min' },
    { label: 'Rating Max', key: 'ratingScale.max' },
    { label: 'Rating Step', key: 'ratingScale.step' },
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
              fullWidth
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
              fullWidth
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
              fullWidth
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
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={2}>
            <CSVLink
              data={filteredFeedbacks}
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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="feedback tabs">
          <Tab label="Created Feedbacks" />
          <Tab label="Voted Feedbacks" />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        <Grid xs={12}>
          <TableContainer 
            component={Paper} 
            sx={{ 
              maxWidth: '100%',
              overflowX: 'auto',
              '&::-webkit-scrollbar': {
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
                '&:hover': {
                  background: '#555',
                },
              },
            }}
          >
            <Table sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow sx={{ 
                  backgroundColor: 'background.paper',
                  '& th': { 
                    color: 'text.primary',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    padding: '16px',
                    borderBottom: '2px solid',
                    borderColor: 'divider'
                  }
                }}>
                  {[
                    'name',
                    'email',
                    'question',
                    'description',
                    'questionType',
                    'options',
                    'ratingScale',
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
                  <TableRow 
                    key={feedback.id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'action.hover',
                      },
                      '& td': { 
                        padding: '12px 16px',
                        fontSize: '0.875rem',
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }
                    }}
                  >
                    <TableCell>{feedback.name}</TableCell>
                    <TableCell>{feedback.email}</TableCell>
                    <TableCell sx={{ maxWidth: '300px' }}>
                      <Tooltip title={feedback.question}>
                        <Typography
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: 1.4,
                          }}
                        >
                          {feedback.question}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ maxWidth: '200px' }}>
                      <Tooltip title={feedback.description}>
                        <Box
                          dangerouslySetInnerHTML={{ __html: feedback.description }}
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: 1.4,
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {feedback.questionType ? <Chip 
                        label={feedback.questionType}
                        size="small"
                        color={
                          feedback.questionType === 'multiple-choice' ? 'primary' :
                          feedback.questionType === 'rating' ? 'secondary' :
                          feedback.questionType === 'text' ? 'info' : 'default'
                        }
                        sx={{ 
                          textTransform: 'capitalize',
                          fontWeight: 500
                        }}
                      />: "-"}
                    </TableCell>
                    <TableCell sx={{ maxWidth: '200px' }}>
                      {feedback.questionType === 'multiple-choice' && (
                        <Box>
                          {feedback.options ? (
                            Array.isArray(feedback.options) ? (
                              feedback.options.map((option: string, index: number) => (
                                <Typography 
                                  key={index} 
                                  sx={{ 
                                    fontSize: '0.875rem',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {option}
                                </Typography>
                              ))
                            ) : (
                              Object.values(feedback.options as Record<string, string>).map((option: string, index: number) => (
                                <Typography 
                                  key={index} 
                                  sx={{ 
                                    fontSize: '0.875rem',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {option}
                                </Typography>
                              ))
                            )
                          ) : null}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      {feedback.questionType === 'rating' && (
                        <Box>
                          <Typography sx={{ fontSize: '0.875rem' }}>
                            {feedback.ratingScale?.min} - {feedback.ratingScale?.max}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                            Step: {feedback.ratingScale?.step}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={feedback.votes?.length || 0}
                        size="small"
                        color="default"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Votes">
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => openDetailsModal(feedback)}
                            sx={{ 
                              minWidth: 'auto',
                              px: 1,
                              py: 0.5
                            }}
                          >
                            <Typography sx={{ fontSize: '0.75rem' }}>Votes</Typography>
                          </Button>
                        </Tooltip>
                        <Tooltip title="Update Feedback">
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => navigate(`/update-feedback/${feedback.id}`)}
                            sx={{ 
                              minWidth: 'auto',
                              px: 1,
                              py: 0.5
                            }}
                          >
                            <Typography sx={{ fontSize: '0.75rem' }}>Update</Typography>
                          </Button>
                        </Tooltip>
                        <Tooltip title="Delete Feedback">
                          <Button 
                            variant="outlined" 
                            color="error"
                            size="small"
                            onClick={() => openDeleteModal(feedback.id)}
                            sx={{ 
                              minWidth: 'auto',
                              px: 1,
                              py: 0.5
                            }}
                          >
                            <Typography sx={{ fontSize: '0.75rem' }}>Delete</Typography>
                          </Button>
                        </Tooltip>
                      </Box>
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
            sx={{ 
              borderTop: '1px solid',
              borderColor: 'divider',
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontSize: '0.875rem'
              }
            }}
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
        <Box sx={{ ...modalStyle, width: 600, maxHeight: '80vh', overflowY: 'auto' }}>
          <Typography variant="h6" gutterBottom>Responses</Typography>
          {selectedDetails && <FeedbackVisualization feedback={selectedDetails} />}
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ 
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <span>Individual Responses</span>
              <Chip 
                label={`${selectedDetails?.votes.length || 0} total`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Typography>
            
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              mt: 2
            }}>
              {selectedDetails?.votes.map((vote, index) => (
                <Paper 
                  key={index} 
                  elevation={0}
                  sx={{ 
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    backgroundColor: 'background.neutral'
                  }}
                >
                  <Typography variant="subtitle2" sx={{ 
                    color: 'text.primary',
                    fontWeight: 600,
                    mb: 1
                  }}>
                    {vote.voterName}
                  </Typography>

                  {selectedDetails.questionType === 'multiple-choice' && (
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mt: 1
                    }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Selected:
                      </Typography>
                      <Chip 
                        label={vote.selectedOption}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  )}

                  {selectedDetails.questionType === 'rating' && (
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mt: 1
                    }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Rating:
                      </Typography>
                      <Chip 
                        label={`${vote.rating} / ${selectedDetails.ratingScale?.max || 5}`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>
                  )}

                  {selectedDetails.questionType === 'text' && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Response:
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        mt: 0.5,
                        p: 1,
                        backgroundColor: 'background.paper',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}>
                        {vote.textResponse}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              ))}
            </Box>
          </Box>

          <Box sx={{ 
            mt: 3,
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <Button 
              variant="outlined" 
              onClick={closeDetailsModal}
              sx={{ minWidth: 100 }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </DashboardContent>
  );
}
