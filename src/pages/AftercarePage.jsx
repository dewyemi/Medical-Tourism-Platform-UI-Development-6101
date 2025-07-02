import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { AuthGuard } from '../hooks/useAuth';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import * as FiIcons from 'react-icons/fi';

const {
  FiHeart,
  FiCalendar,
  FiPhone,
  FiMessageCircle,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiLoader,
  FiActivity,
  FiTrendingUp,
  FiUpload,
  FiDownload,
  FiVideo,
  FiUsers,
  FiFileText,
  FiBarChart3
} = FiIcons;

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AftercarePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, profile, role } = useAuth();
  const [activeTab, setActiveTab] = useState('plan');
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);

  // Data states
  const [aftercarePlan, setAftercarePlan] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Form states
  const [showNewReport, setShowNewReport] = useState(false);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [reportFile, setReportFile] = useState(null);
  const [reportForm, setReportForm] = useState({
    title: '',
    notes: '',
    pain_score: 5
  });
  const [appointmentForm, setAppointmentForm] = useState({
    date: '',
    time: '',
    doctor: '',
    type: 'follow-up',
    zoom_link: ''
  });

  const tabs = [
    { id: 'plan', label: 'My Plan', icon: FiFileText },
    { id: 'progress', label: 'Progress', icon: FiTrendingUp },
    { id: 'appointments', label: 'Appointments', icon: FiCalendar }
  ];

  const appointmentTypes = [
    { value: 'follow-up', label: 'Follow-up Consultation' },
    { value: 'checkup', label: 'Medical Checkup' },
    { value: 'therapy', label: 'Physical Therapy' },
    { value: 'emergency', label: 'Emergency Consultation' }
  ];

  useEffect(() => {
    initializeData();
  }, [user, role]);

  useEffect(() => {
    if (selectedPatient) {
      loadPatientData(selectedPatient.user_id);
    }
  }, [selectedPatient]);

  const initializeData = async () => {
    try {
      setLoading(true);
      if (role === 'admin' || role === 'employee') {
        // Load all patients for staff
        await loadPatients();
      } else {
        // Load current user's data
        await loadPatientData(user.id);
      }
    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles_2024')
        .select('*')
        .eq('role', 'client')
        .order('full_name');

      if (error) throw error;
      setPatients(data || []);
      if (data && data.length > 0) {
        setSelectedPatient(data[0]);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const loadPatientData = async (patientId) => {
    try {
      await Promise.all([
        loadAftercarePlan(patientId),
        loadProgressData(patientId),
        loadAppointments(patientId)
      ]);
    } catch (error) {
      console.error('Error loading patient data:', error);
    }
  };

  const loadAftercarePlan = async (patientId) => {
    try {
      const { data, error } = await supabase
        .from('aftercare_plans_2024')
        .select('*')
        .eq('user_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      setAftercarePlan(data?.[0] || null);
    } catch (error) {
      console.error('Error loading aftercare plan:', error);
    }
  };

  const loadProgressData = async (patientId) => {
    try {
      const { data, error } = await supabase
        .from('aftercare_reports_2024')
        .select('*')
        .eq('user_id', patientId)
        .order('report_date', { ascending: true });

      if (error) throw error;
      setProgressData(data || []);
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  const loadAppointments = async (patientId) => {
    try {
      const { data, error } = await supabase
        .from('virtual_appointments_2024')
        .select('*')
        .eq('user_id', patientId)
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const uploadReportFile = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('aftercare-reports')
        .upload(fileName, file);

      if (error) throw error;
      return data.path;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      let reportUrl = null;
      if (reportFile) {
        reportUrl = await uploadReportFile(reportFile);
      }

      const targetPatientId = selectedPatient?.user_id || user.id;
      const { error } = await supabase
        .from('aftercare_reports_2024')
        .insert({
          user_id: targetPatientId,
          title: reportForm.title,
          notes: reportForm.notes,
          pain_score: reportForm.pain_score,
          report_url: reportUrl,
          report_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Reset form
      setReportForm({ title: '', notes: '', pain_score: 5 });
      setReportFile(null);
      setShowNewReport(false);

      // Reload data
      await loadPatientData(targetPatientId);
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const targetPatientId = selectedPatient?.user_id || user.id;
      const { error } = await supabase
        .from('virtual_appointments_2024')
        .insert({
          user_id: targetPatientId,
          appointment_date: appointmentForm.date,
          appointment_time: appointmentForm.time,
          doctor: appointmentForm.doctor,
          type: appointmentForm.type,
          zoom_link: appointmentForm.zoom_link,
          status: 'scheduled',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Reset form
      setAppointmentForm({
        date: '',
        time: '',
        doctor: '',
        type: 'follow-up',
        zoom_link: ''
      });
      setShowNewAppointment(false);

      // Reload appointments
      await loadAppointments(targetPatientId);
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const deleteAppointment = async (id) => {
    try {
      const { error } = await supabase
        .from('virtual_appointments_2024')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const targetPatientId = selectedPatient?.user_id || user.id;
      await loadAppointments(targetPatientId);
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  // Chart.js configuration
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Pain Score Progress Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        title: {
          display: true,
          text: 'Pain Score (1-10)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    },
  };

  const chartData = {
    labels: progressData.map(item => new Date(item.report_date).toLocaleDateString()),
    datasets: [
      {
        label: 'Pain Score',
        data: progressData.map(item => item.pain_score),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <SafeIcon icon={FiLoader} className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiHeart} className="w-8 h-8" />
              <h1 className="text-2xl lg:text-3xl font-bold">Aftercare Dashboard</h1>
            </div>

            {/* Patient Selector for Staff */}
            {(role === 'admin' || role === 'employee') && (
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiUsers} className="w-5 h-5" />
                <select
                  value={selectedPatient?.user_id || ''}
                  onChange={(e) => {
                    const patient = patients.find(p => p.user_id === e.target.value);
                    setSelectedPatient(patient);
                  }}
                  className="bg-white/20 text-white rounded-lg px-3 py-2 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient.user_id} value={patient.user_id} className="text-gray-900">
                      {patient.full_name || patient.email}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <SafeIcon icon={tab.icon} className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* TAB 1: My Plan */}
          {activeTab === 'plan' && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Plan Overview */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Treatment Plan</h2>
                {aftercarePlan ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Next Follow-up Date
                        </label>
                        <p className="text-gray-900 font-semibold">
                          {aftercarePlan.follow_up_date 
                            ? new Date(aftercarePlan.follow_up_date).toLocaleDateString()
                            : 'Not scheduled'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Treatment Status
                        </label>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {aftercarePlan.status || 'Active'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Doctor's Notes
                      </label>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {aftercarePlan.doctor_notes || 'No notes available'}
                        </p>
                      </div>
                    </div>
                    {aftercarePlan.report_url && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Latest Report
                        </label>
                        <a
                          href={`${supabase.storage.from('aftercare-reports').getPublicUrl(aftercarePlan.report_url).data.publicUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                        >
                          <SafeIcon icon={FiDownload} className="w-4 h-4" />
                          <span>Download Report</span>
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No treatment plan available</p>
                )}
              </div>

              {/* Upload New Report */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Upload New Report</h2>
                  <button
                    onClick={() => setShowNewReport(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiPlus} className="w-4 h-4" />
                    <span>New Report</span>
                  </button>
                </div>

                {/* Recent Reports */}
                <div className="space-y-3">
                  {progressData.slice(0, 3).map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{report.title}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(report.report_date).toLocaleDateString()} • Pain Score: {report.pain_score}/10
                        </p>
                      </div>
                      {report.report_url && (
                        <a
                          href={`${supabase.storage.from('aftercare-reports').getPublicUrl(report.report_url).data.publicUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <SafeIcon icon={FiDownload} className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: Progress */}
          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                {progressData.length > 0 ? (
                  <div className="h-96">
                    <Line options={chartOptions} data={chartData} />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <SafeIcon icon={FiBarChart3} className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No progress data available yet</p>
                    <button
                      onClick={() => setShowNewReport(true)}
                      className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Add First Report
                    </button>
                  </div>
                )}
              </div>

              {/* Progress Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <SafeIcon icon={FiActivity} className="w-6 h-6 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Latest Score</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {progressData.length > 0 
                      ? `${progressData[progressData.length - 1].pain_score}/10`
                      : 'N/A'
                    }
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Trend</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {progressData.length >= 2 ? (
                      progressData[progressData.length - 1].pain_score < progressData[progressData.length - 2].pain_score
                        ? '↓ Improving'
                        : '↑ Monitor'
                    ) : 'N/A'}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <SafeIcon icon={FiCalendar} className="w-6 h-6 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Reports</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{progressData.length}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: Appointments */}
          {activeTab === 'appointments' && (
            <motion.div
              key="appointments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Virtual Appointments</h2>
                  <button
                    onClick={() => setShowNewAppointment(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiPlus} className="w-4 h-4" />
                    <span>Schedule Visit</span>
                  </button>
                </div>

                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                Dr. {appointment.doctor}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                appointment.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : appointment.status === 'scheduled'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {appointment.status}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center space-x-1">
                                <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                                <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <SafeIcon icon={FiClock} className="w-4 h-4" />
                                <span>{appointment.appointment_time}</span>
                              </span>
                              <span className="capitalize">{appointment.type}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {appointment.zoom_link && (
                              <a
                                href={appointment.zoom_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                              >
                                <SafeIcon icon={FiVideo} className="w-4 h-4" />
                                <span>Join Call</span>
                              </a>
                            )}
                            <button
                              onClick={() => deleteAppointment(appointment.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <SafeIcon icon={FiCalendar} className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No appointments scheduled</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Report Modal */}
      <AnimatePresence>
        {showNewReport && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Add Progress Report</h3>
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Report title"
                  value={reportForm.title}
                  onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pain Score (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={reportForm.pain_score}
                    onChange={(e) => setReportForm({ ...reportForm, pain_score: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 (No pain)</span>
                    <span className="font-medium">{reportForm.pain_score}</span>
                    <span>10 (Severe)</span>
                  </div>
                </div>

                <textarea
                  placeholder="Additional notes..."
                  value={reportForm.notes}
                  onChange={(e) => setReportForm({ ...reportForm, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Report File (optional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setReportFile(e.target.files[0])}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Save Report
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewReport(false)}
                    className="px-6 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Appointment Modal */}
      <AnimatePresence>
        {showNewAppointment && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Schedule Virtual Visit</h3>
              <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Doctor name"
                  value={appointmentForm.doctor}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, doctor: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <select
                  value={appointmentForm.type}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {appointmentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={appointmentForm.date}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="time"
                    value={appointmentForm.time}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <input
                  type="url"
                  placeholder="Zoom meeting link (optional)"
                  value={appointmentForm.zoom_link}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, zoom_link: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewAppointment(false)}
                    className="px-6 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Wrap the component with AuthGuard for patient role
const ProtectedAftercarePage = () => {
  return (
    <AuthGuard roles={['client', 'patient']}>
      <AftercarePage />
    </AuthGuard>
  );
};

export default ProtectedAftercarePage;