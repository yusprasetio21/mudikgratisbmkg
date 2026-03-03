'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Plus, Edit, Trash2, Bus, MapPin, Users, Calendar, Save, X, LogOut, User as UserIcon,
  CheckCircle, FileText, Settings, Download, Filter, Search, QrCode, Printer, Armchair, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

interface City {
  id: string;
  name: string;
  province: string;
  description: string;
  isActive: boolean;
}

interface Bus {
  id: string;
  busNumber: string;
  plateNumber: string;
  cityId: string;
  cityName: string;
  capacity: number;
  available: number;
  description: string;
  departureDate: string;
  isActive: boolean;
}

interface Participant {
  id: string;
  busId: string;
  stopId: string;
  participantType: string;
  name: string;
  nip: string;
  phone: string;
  address: string;
  totalFamily: number;
  registrationDate: string;
  status: string;
  notes: string;
  familyMembers: any[];
}

export default function MudikGratisAdminPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string; id: string } | null>(null);

  // Dashboard data
  const [summary, setSummary] = useState<any>(null);

  // Cities data
  const [cities, setCities] = useState<City[]>([]);
  const [showCityForm, setShowCityForm] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [cityFormData, setCityFormData] = useState({
    name: '',
    province: '',
    description: '',
  });

  // Buses data
  const [buses, setBuses] = useState<Bus[]>([]);
  const [showBusForm, setShowBusForm] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [busFormData, setBusFormData] = useState({
    busNumber: '',
    plateNumber: '',
    cityId: '',
    capacity: 40,
    description: '',
    departureDate: '',
  });

  // Participants data
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  
  // Reregistration verification state
  const [verificationModal, setVerificationModal] = useState<{
    isOpen: boolean;
    participantId: string;
    participantName: string;
    dpAmount: string;
    isApproving: boolean;
  }>({
    isOpen: false,
    participantId: '',
    participantName: '',
    dpAmount: '',
    isApproving: false,
  });

  // Reregistrations (simulated data)
  const [reregistrations, setReregistrations] = useState<any[]>([]);

  // Seat allocation data
  const [seatAllocations, setSeatAllocations] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [printMode, setPrintMode] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    eventTitle: 'MUDIK GRATIS KORPRI BMKG 2025',
    eventActive: true,
    showReregBanner: true,
    showBusCheckBanner: true,
    registrationOpenDate: '',
    registrationCloseDate: '',
    reregistrationOpenDate: '',
    reregistrationCloseDate: '',
  });

  // Report data for sponsor proposal
  const [reportData, setReportData] = useState<any>({
    totalParticipants: 8,
    totalASNs: 5,
    totalNonASNs: 3,
    totalCities: 3,
    totalBuses: 4,
    totalAvailable: 141,
    totalBooked: 19,
    cities: [],
  });

  // Fetch cities saat komponen pertama kali dimuat
  useEffect(() => {
    fetchCities();
  }, []);

  // Fetch settings from database
  const fetchSettings = async () => {
    try {
      const settingsRes = await fetch('/api/mudikgratis/settings');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData.data || settings);
      }
    } catch (e) {
      console.log('Using fallback settings');
    }
  };

  // Fetch data based on active tab
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Always fetch settings first
        await fetchSettings();

        if (activeTab === 'dashboard') await fetchSummary();
        else if (activeTab === 'cities') await fetchCities();
        else if (activeTab === 'buses') await fetchBuses();
        else if (activeTab === 'participants') await fetchParticipants();
        else if (activeTab === 'verification') {
          await fetchParticipants();
          // Simulated reregistrations data
          setReregistrations([
            {
              id: 'RR-001',
              participantId: 'P-001',
              participantName: 'Ahmad Fauzi',
              participantType: 'ASN',
              totalFamily: 2,
              reregistrationDate: new Date().toISOString(),
              status: 'pending',
              dpAmount: null,
            },
            {
              id: 'RR-002',
              participantId: 'P-002',
              participantName: 'Siti Nurhaliza',
              participantType: 'Non-ASN',
              totalFamily: 1,
              reregistrationDate: new Date(Date.now() - 86400000).toISOString(),
              status: 'pending',
              dpAmount: null,
            },
            {
              id: 'RR-003',
              participantId: 'P-003',
              participantName: 'Budi Santoso',
              participantType: 'ASN',
              totalFamily: 3,
              reregistrationDate: new Date(Date.now() - 172800000).toISOString(),
              status: 'approved',
              dpAmount: '500000',
            },
          ]);
        } else if (activeTab === 'seats') {
          // Add print styles
          if (!document.getElementById('print-styles')) {
            const style = document.createElement('style');
            style.id = 'print-styles';
            style.textContent = `
              @media print {
                .no-print { display: none !important; }
                body { background: white; }
                .page-break { page-break-before: always; }
                @page { size: A4; margin: 1.5cm; }
              }
            `;
            document.head.appendChild(style);
          }

          // Simulated seat allocation data
          setSeatAllocations([
            {
              id: 'B-001',
              busNumber: 'B-001',
              cityId: 'C-001',
              cityName: 'Semarang',
              capacity: 40,
              participants: [
                {
                  participantId: 'P-001',
                  name: 'Ahmad Fauzi',
                  familyMembers: 2,
                  seats: ['A-1', 'A-2', 'A-3'],
                  status: 'approved',
                },
                {
                  participantId: 'P-002',
                  name: 'Siti Nurhaliza',
                  familyMembers: 1,
                  seats: ['A-4', 'A-5'],
                  status: 'approved',
                },
                {
                  participantId: 'P-003',
                  name: 'Budi Santoso',
                  familyMembers: 3,
                  seats: ['A-6', 'A-7', 'A-8', 'A-9'],
                  status: 'approved',
                },
                {
                  participantId: 'P-004',
                  name: 'Dewi Sartika',
                  familyMembers: 0,
                  seats: ['A-10'],
                  status: 'approved',
                },
                {
                  participantId: 'P-005',
                  name: 'Eko Prasetyo',
                  familyMembers: 2,
                  seats: ['A-11', 'A-12', 'A-13'],
                  status: 'approved',
                },
              ],
            },
            {
              id: 'B-002',
              busNumber: 'B-002',
              cityId: 'C-001',
              cityName: 'Semarang',
              capacity: 40,
              participants: [
                {
                  participantId: 'P-006',
                  name: 'Fatimah Azzahra',
                  familyMembers: 1,
                  seats: ['A-1', 'A-2'],
                  status: 'approved',
                },
                {
                  participantId: 'P-007',
                  name: 'Gunawan Wibisono',
                  familyMembers: 0,
                  seats: ['A-3'],
                  status: 'approved',
                },
              ],
            },
            {
              id: 'B-003',
              busNumber: 'B-003',
              cityId: 'C-002',
              cityName: 'Surabaya',
              capacity: 40,
              participants: [
                {
                  participantId: 'P-008',
                  name: 'Haryanto Putra',
                  familyMembers: 2,
                  seats: ['A-1', 'A-2', 'A-3'],
                  status: 'approved',
                },
              ],
            },
            {
              id: 'B-004',
              busNumber: 'B-004',
              cityId: 'C-003',
              cityName: 'Yogyakarta',
              capacity: 40,
              participants: [],
            },
          ]);
        } else if (activeTab === 'report') {
          // Auto-generate report when tab is active
          await handleGenerateReport();
        } else if (activeTab === 'settings') {
          // Fetch fresh settings when entering settings tab
          await fetchSettings();
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab]);

  // Inject toast animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
      @keyframes toast-in {
        0% {
          opacity: 0;
          transform: translateX(100%) scale(0.8);
        }
        100% {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
      }
      .animate-toast-in {
        animation: toast-in 0.3s ease-out forwards;
      }
    `;
    document.head.appendChild(style);
    return () => {
      const styleElement = document.getElementById('toast-animations');
      if (styleElement) styleElement.remove();
    };
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    const id = Date.now().toString();
    setMessage({ type, text, id });
    setTimeout(() => setMessage(null), 4000);
  };

  // Fetch functions
  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/mudikgratis/summary');
      if (response.ok) {
        const data = await response.json();
        setSummary(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/mudikgratis/cities');
      if (response.ok) {
        const data = await response.json();
        // Pastikan data selalu array
        const citiesData = data.data || data || [];
        setCities(Array.isArray(citiesData) ? citiesData : []);
        console.log('Cities loaded:', citiesData); // Untuk debugging
      } else {
        console.error('Failed to fetch cities:', response.status);
        setCities([]);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    }
  };

  const fetchBuses = async () => {
    try {
      const response = await fetch('/api/mudikgratis/buses');
      if (response.ok) {
        const data = await response.json();
        const busesData = data.data || data || [];
        setBuses(Array.isArray(busesData) ? busesData : []);
      } else {
        setBuses([]);
      }
    } catch (error) {
      console.error('Error fetching buses:', error);
      setBuses([]);
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await fetch('/api/mudikgratis/participants');
      if (response.ok) {
        const data = await response.json();
        const participantsData = data.data || data || [];
        setParticipants(Array.isArray(participantsData) ? participantsData : []);
      } else {
        setParticipants([]);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
      setParticipants([]);
    }
  };

  // City functions
  const handleCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingCity
        ? `/api/mudikgratis/cities/${editingCity.id}`
        : '/api/mudikgratis/cities';

      const response = await fetch(url, {
        method: editingCity ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cityFormData),
      });

      if (response.ok) {
        showMessage('success', editingCity ? 'Kota berhasil diperbarui' : 'Kota berhasil ditambahkan');
        resetCityForm();
        await fetchCities();
      } else {
        const error = await response.json();
        showMessage('error', error.error || 'Gagal menyimpan kota');
      }
    } catch (error) {
      showMessage('error', 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleCityDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kota ini?')) return;

    try {
      const response = await fetch(`/api/mudikgratis/cities/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showMessage('success', 'Kota berhasil dihapus');
        await fetchCities();
      } else {
        showMessage('error', 'Gagal menghapus kota');
      }
    } catch (error) {
      showMessage('error', 'Terjadi kesalahan');
    }
  };

  const resetCityForm = () => {
    setCityFormData({ name: '', province: '', description: '' });
    setEditingCity(null);
    setShowCityForm(false);
  };

  // Fungsi untuk membuka form bus
  const handleOpenBusForm = () => {
    // Fetch cities terlebih dahulu sebelum membuka form
    fetchCities().then(() => {
      setShowBusForm(true);
    });
  };

  // Fungsi untuk edit bus
  const handleEditBus = (bus: Bus) => {
    // Fetch cities terlebih dahulu sebelum membuka form edit
    fetchCities().then(() => {
      setEditingBus(bus);
      setBusFormData({
        busNumber: bus.busNumber,
        plateNumber: bus.plateNumber,
        cityId: bus.cityId,
        capacity: bus.capacity,
        description: bus.description,
        departureDate: bus.departureDate || '',
      });
      setShowBusForm(true);
    });
  };

  // Bus functions
  const handleBusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingBus
        ? `/api/mudikgratis/buses/${editingBus.id}`
        : '/api/mudikgratis/buses';

      const response = await fetch(url, {
        method: editingBus ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(busFormData),
      });

      if (response.ok) {
        showMessage('success', editingBus ? 'Bus berhasil diperbarui' : 'Bus berhasil ditambahkan');
        resetBusForm();
        await fetchBuses();
      } else {
        const error = await response.json();
        showMessage('error', error.error || 'Gagal menyimpan bus');
      }
    } catch (error) {
      showMessage('error', 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleBusDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus bus ini?')) return;

    try {
      const response = await fetch(`/api/mudikgratis/buses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showMessage('success', 'Bus berhasil dihapus');
        await fetchBuses();
      } else {
        showMessage('error', 'Gagal menghapus bus');
      }
    } catch (error) {
      showMessage('error', 'Terjadi kesalahan');
    }
  };

  const resetBusForm = () => {
    setBusFormData({
      busNumber: '',
      plateNumber: '',
      cityId: '',
      capacity: 40,
      description: '',
      departureDate: '',
    });
    setEditingBus(null);
    setShowBusForm(false);
  };

  // Participant functions
  const handleParticipantDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus peserta ini?')) return;

    try {
      const response = await fetch(`/api/mudikgratis/participants/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showMessage('success', 'Peserta berhasil dihapus');
        await fetchParticipants();
        setSelectedParticipant(null);
      } else {
        showMessage('error', 'Gagal menghapus peserta');
      }
    } catch (error) {
      showMessage('error', 'Terjadi kesalahan');
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Reregistration verification handlers
  const handleOpenVerification = (participantId: string, participantName: string) => {
    setVerificationModal({
      isOpen: true,
      participantId,
      participantName,
      dpAmount: '',
      isApproving: false,
    });
  };

  const handleCloseVerification = () => {
    setVerificationModal({
      isOpen: false,
      participantId: '',
      participantName: '',
      dpAmount: '',
      isApproving: false,
    });
  };

  const handleApproveReregistration = async () => {
    if (!verificationModal.dpAmount || !verificationModal.dpAmount.trim()) {
      alert('Mohon isi nominal DP');
      return;
    }

    setVerificationModal({ ...verificationModal, isApproving: true });

    try {
      // TODO: Call API to approve reregistration with DP amount
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update reregistrations list
      setReregistrations(reregistrations.map(r => 
        r.participantId === verificationModal.participantId
          ? { ...r, status: 'approved', dpAmount: verificationModal.dpAmount }
          : r
      ));

      showMessage('success', `Daftar ulang ${verificationModal.participantName} berhasil disetujui`);
      handleCloseVerification();
    } catch (error) {
      showMessage('error', 'Gagal menyetujui daftar ulang');
    } finally {
      setVerificationModal({ ...verificationModal, isApproving: false });
    }
  };

  const handleRejectReregistration = async (participantId: string) => {
    if (!confirm('Apakah Anda yakin ingin menolak daftar ulang ini?')) return;

    try {
      // TODO: Call API to reject reregistration
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update reregistrations list
      setReregistrations(reregistrations.map(r => 
        r.participantId === participantId
          ? { ...r, status: 'rejected' }
          : r
      ));

      showMessage('success', 'Daftar ulang berhasil ditolak');
    } catch (error) {
      showMessage('error', 'Gagal menolak daftar ulang');
    }
  };

  // Print handlers
  const handlePrintList = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 100);
  };

  const handleGenerateQR = (participant: any, busNumber: string) => {
    // TODO: Generate QR code with participant and bus info
    showMessage('success', `QR Code untuk ${participant.name} di Bus ${busNumber} sedang digenerate...`);
  };

  // Settings handler
  const handleSaveSettings = async () => {
    try {
      setLoading(true);

      // Save settings to API
      const response = await fetch('/api/mudikgratis/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const result = await response.json();
        // Update local state with saved data
        if (result.data) {
          setSettings(result.data);
        }
        showMessage('success', 'Simpan pengaturan berhasil');
      } else {
        showMessage('error', 'Gagal menyimpan pengaturan');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', 'Gagal menyimpan pengaturan');
    } finally {
      setLoading(false);
    }
  };

  // Report handlers
  const handleGenerateReport = async () => {
    try {
      setLoading(true);

      // Try to fetch data from Golang backend
      let participants: any = { data: [] };
      let cities: any = { data: [] };
      let buses: any = { data: [] };
      let useFallback = false;

      try {
        const [participantsRes, citiesRes, busesRes] = await Promise.all([
          fetch('/api/mudikgratis/participants'),
          fetch('/api/mudikgratis/cities'),
          fetch('/api/mudikgratis/buses'),
        ]);

        if (participantsRes.ok) participants = await participantsRes.json();
        if (citiesRes.ok) cities = await citiesRes.json();
        if (busesRes.ok) buses = await busesRes.json();

        // If all requests failed, use fallback data
        if (!participantsRes.ok && !citiesRes.ok && !busesRes.ok) {
          useFallback = true;
        }
      } catch (error) {
        console.log('Using fallback data for report:', error);
        useFallback = true;
      }

      // Use fallback data if backend is not available
      if (useFallback || (!participants.data?.length && !cities.data?.length && !buses.data?.length)) {
        participants = {
          data: [
            { id: 'P-001', cityId: 'C-001', participantType: 'ASN', name: 'Ahmad Fauzi', nip: '198501012010011001', phone: '081234567890', totalFamily: 2, registrationDate: '2025-01-15', status: 'approved' },
            { id: 'P-002', cityId: 'C-001', participantType: 'Non-ASN', name: 'Siti Nurhaliza', nip: '', phone: '081234567891', totalFamily: 1, registrationDate: '2025-01-16', status: 'approved' },
            { id: 'P-003', cityId: 'C-001', participantType: 'ASN', name: 'Budi Santoso', nip: '198702022011012002', phone: '081234567892', totalFamily: 3, registrationDate: '2025-01-17', status: 'approved' },
            { id: 'P-004', cityId: 'C-001', participantType: 'Non-ASN', name: 'Dewi Sartika', nip: '', phone: '081234567893', totalFamily: 0, registrationDate: '2025-01-18', status: 'approved' },
            { id: 'P-005', cityId: 'C-002', participantType: 'ASN', name: 'Eko Prasetyo', nip: '198803032012031003', phone: '081234567894', totalFamily: 2, registrationDate: '2025-01-19', status: 'approved' },
            { id: 'P-006', cityId: 'C-002', participantType: 'ASN', name: 'Fatimah Azzahra', nip: '199004042013041004', phone: '081234567895', totalFamily: 1, registrationDate: '2025-01-20', status: 'approved' },
            { id: 'P-007', cityId: 'C-003', participantType: 'Non-ASN', name: 'Gunawan Wibisono', nip: '', phone: '081234567896', totalFamily: 0, registrationDate: '2025-01-21', status: 'approved' },
            { id: 'P-008', cityId: 'C-003', participantType: 'Non-ASN', name: 'Haryanto Putra', nip: '', phone: '081234567897', totalFamily: 2, registrationDate: '2025-01-22', status: 'approved' },
          ]
        };

        cities = {
          data: [
            { id: 'C-001', name: 'Semarang', province: 'Jawa Tengah' },
            { id: 'C-002', name: 'Surabaya', province: 'Jawa Timur' },
            { id: 'C-003', name: 'Yogyakarta', province: 'D.I. Yogyakarta' },
          ]
        };

        buses = {
          data: [
            { id: 'B-001', cityId: 'C-001', capacity: 40, available: 28 },
            { id: 'B-002', cityId: 'C-001', capacity: 40, available: 38 },
            { id: 'B-003', cityId: 'C-002', capacity: 40, available: 37 },
            { id: 'B-004', cityId: 'C-003', capacity: 40, available: 38 },
          ]
        };

        if (useFallback) {
          showMessage('success', 'Menggunakan data simulasi untuk laporan');
        }
      }

      // Ensure data is array
      const participantsArray = Array.isArray(participants.data) ? participants.data : [];
      const citiesArray = Array.isArray(cities.data) ? cities.data : [];
      const busesArray = Array.isArray(buses.data) ? buses.data : [];

      // Calculate report data
      const totalParticipants = participantsArray.length || 0;
      const totalASNs = participantsArray.filter((p: any) => p.participantType === 'ASN').length || 0;
      const totalNonASNs = participantsArray.filter((p: any) => p.participantType === 'Non-ASN').length || 0;
      const totalBuses = busesArray.length || 0;

      // Group participants by city
      const citiesWithParticipants = citiesArray.map((city: any) => {
        const cityParticipants = participantsArray.filter((p: any) => p.cityId === city.id);
        const cityBuses = busesArray.filter((b: any) => b.cityId === city.id);
        const cityASNs = cityParticipants.filter((p: any) => p.participantType === 'ASN').length;
        const cityNonASNs = cityParticipants.filter((p: any) => p.participantType === 'Non-ASN').length;
        
        return {
          id: city.id,
          name: city.name,
          province: city.province,
          totalParticipants: cityParticipants.length,
          totalASNs: cityASNs,
          totalNonASNs: cityNonASNs,
          totalBuses: cityBuses.length,
          participants: cityParticipants.map((p: any) => ({
            id: p.id,
            name: p.name,
            nip: p.nip || '-',
            phone: p.phone || '-',
            participantType: p.participantType,
            totalFamily: p.totalFamily,
            registrationDate: p.registrationDate,
            status: p.status,
          })),
        };
      });

      setReportData({
        totalParticipants,
        totalASNs,
        totalNonASNs,
        totalCities: citiesArray.length || 0,
        totalBuses,
        totalAvailable: busesArray.reduce((acc: any, b: any) => acc + (b.available || 0), 0),
        totalBooked: busesArray.reduce((acc: any, b: any) => acc + ((b.capacity || 0) - (b.available || 0)), 0),
        cities: citiesWithParticipants,
      });

    } catch (error) {
      console.error('Error generating report:', error);
      showMessage('error', 'Gagal menghasilkan laporan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Elegant Toast Notification */}
      {message && (
        <div className="fixed top-4 right-4 z-50 animate-toast-in">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl transform transition-all duration-300 hover:scale-105 ${
            message.type === 'error'
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
              : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
          }`}>
            {message.type === 'error' ? (
              <X className="w-5 h-5 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-medium text-sm">{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="ml-2 hover:opacity-80 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Halaman Utama
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium">{session?.user?.name || 'Admin'}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Mudik Gratis</h1>
          <p className="text-gray-600">Kelola program mudik gratis</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-8">
            <TabsTrigger value="dashboard">
              <Calendar className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="cities">
              <MapPin className="h-4 w-4 mr-2" />
              Kota Tujuan
            </TabsTrigger>
            <TabsTrigger value="buses">
              <Bus className="h-4 w-4 mr-2" />
              Bus
            </TabsTrigger>
            <TabsTrigger value="participants">
              <Users className="h-4 w-4 mr-2" />
              Peserta
            </TabsTrigger>
            <TabsTrigger value="verification">
              <CheckCircle className="h-4 w-4 mr-2" />
              Verifikasi
            </TabsTrigger>
            <TabsTrigger value="seats">
              <Armchair className="h-4 w-4 mr-2" />
              Pengaturan Kursi
            </TabsTrigger>
            <TabsTrigger value="report">
              <FileText className="h-4 w-4 mr-2" />
              Report
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Pengaturan
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Total Kota</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{summary?.totalCities || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Total Bus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-600">{summary?.totalBuses || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Total Peserta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{summary?.totalParticipants || 0}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {summary?.totalASNs || 0} ASN • {summary?.totalNonASNs || 0} Non-ASN
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Kursi Tersedia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{summary?.totalAvailable || 0}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {summary?.totalBooked || 0} sudah dipesan
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cities Tab */}
          <TabsContent value="cities">
            <Card>
              <CardHeader>
                <CardTitle>Kelola Kota Tujuan</CardTitle>
                <CardDescription>Tambah dan kelola kota tujuan mudik gratis</CardDescription>
              </CardHeader>
              <CardContent>
                {!showCityForm ? (
                  <div className="space-y-4">
                    <Button onClick={() => setShowCityForm(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Tambah Kota Baru
                    </Button>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama Kota</TableHead>
                            <TableHead>Provinsi</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Array.isArray(cities) && cities.length > 0 ? (
                            cities.map((city) => (
                              <TableRow key={city.id}>
                                <TableCell className="font-medium">{city.name}</TableCell>
                                <TableCell>{city.province}</TableCell>
                                <TableCell>
                                  <Badge variant={city.isActive ? 'default' : 'secondary'}>
                                    {city.isActive ? 'Aktif' : 'Nonaktif'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingCity(city);
                                      setCityFormData({
                                        name: city.name,
                                        province: city.province,
                                        description: city.description,
                                      });
                                      setShowCityForm(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCityDelete(city.id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                {loading ? 'Memuat data...' : 'Belum ada data kota'}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCitySubmit} className="space-y-4">
                    <div>
                      <Label>Nama Kota *</Label>
                      <Input
                        value={cityFormData.name}
                        onChange={(e) => setCityFormData({ ...cityFormData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Provinsi</Label>
                      <Input
                        value={cityFormData.province}
                        onChange={(e) => setCityFormData({ ...cityFormData, province: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Deskripsi</Label>
                      <Input
                        value={cityFormData.description}
                        onChange={(e) => setCityFormData({ ...cityFormData, description: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={loading} className="gap-2">
                        <Save className="h-4 w-4" />
                        {loading ? 'Menyimpan...' : 'Simpan'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetCityForm} className="gap-2">
                        <X className="h-4 w-4" />
                        Batal
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Buses Tab */}
          <TabsContent value="buses">
            <Card>
              <CardHeader>
                <CardTitle>Kelola Bus</CardTitle>
                <CardDescription>Tambah dan kelola bus mudik gratis</CardDescription>
              </CardHeader>
              <CardContent>
                {!showBusForm ? (
                  <div className="space-y-4">
                    <Button onClick={handleOpenBusForm} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Tambah Bus Baru
                    </Button>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>No. Bus</TableHead>
                            <TableHead>Plat Nomor</TableHead>
                            <TableHead>Kota Tujuan</TableHead>
                            <TableHead>Kapasitas</TableHead>
                            <TableHead>Tersedia</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Array.isArray(buses) && buses.length > 0 ? (
                            buses.map((bus) => (
                              <TableRow key={bus.id}>
                                <TableCell className="font-medium">{bus.busNumber}</TableCell>
                                <TableCell>{bus.plateNumber || '-'}</TableCell>
                                <TableCell>{bus.cityName || '-'}</TableCell>
                                <TableCell>{bus.capacity}</TableCell>
                                <TableCell>
                                  <Badge variant={bus.available > 0 ? 'default' : 'destructive'}>
                                    {bus.available}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={bus.isActive ? 'default' : 'secondary'}>
                                    {bus.isActive ? 'Aktif' : 'Nonaktif'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditBus(bus)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleBusDelete(bus.id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                {loading ? 'Memuat data...' : 'Belum ada data bus'}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleBusSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nomor Bus *</Label>
                        <Input
                          value={busFormData.busNumber}
                          onChange={(e) => setBusFormData({ ...busFormData, busNumber: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Plat Nomor</Label>
                        <Input
                          value={busFormData.plateNumber}
                          onChange={(e) => setBusFormData({ ...busFormData, plateNumber: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Kota Tujuan *</Label>
                      <Select
                        value={busFormData.cityId}
                        onValueChange={(value) => setBusFormData({ ...busFormData, cityId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={cities.length === 0 ? "Memuat kota..." : "Pilih kota"} />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.length === 0 ? (
                            <div className="flex items-center justify-center p-4">
                              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              <span className="ml-2 text-sm text-gray-500">Memuat data kota...</span>
                            </div>
                          ) : Array.isArray(cities) && cities.length > 0 ? (
                            cities.map((city) => (
                              <SelectItem key={city.id} value={city.id}>
                                {city.name}, {city.province}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-4 text-center text-sm text-gray-500">
                              Belum ada data kota. Silakan tambah kota terlebih dahulu.
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Kapasitas Kursi *</Label>
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        value={busFormData.capacity}
                        onChange={(e) => setBusFormData({ ...busFormData, capacity: parseInt(e.target.value) || 40 })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Tanggal Keberangkatan</Label>
                      <Input
                        type="date"
                        value={busFormData.departureDate}
                        onChange={(e) => setBusFormData({ ...busFormData, departureDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Deskripsi</Label>
                      <Input
                        value={busFormData.description}
                        onChange={(e) => setBusFormData({ ...busFormData, description: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={loading} className="gap-2">
                        <Save className="h-4 w-4" />
                        {loading ? 'Menyimpan...' : 'Simpan'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetBusForm} className="gap-2">
                        <X className="h-4 w-4" />
                        Batal
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Daftar Peserta</CardTitle>
                  <CardDescription>Semua peserta yang terdaftar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border max-h-[600px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama</TableHead>
                          <TableHead>Tipe</TableHead>
                          <TableHead>Keluarga</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(participants) && participants.length > 0 ? (
                          participants.map((participant) => (
                            <TableRow
                              key={participant.id}
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => setSelectedParticipant(participant)}
                            >
                              <TableCell className="font-medium">{participant.name}</TableCell>
                              <TableCell>
                                <Badge variant={participant.participantType === 'ASN' ? 'default' : 'secondary'}>
                                  {participant.participantType}
                                </Badge>
                              </TableCell>
                              <TableCell>{participant.totalFamily} orang</TableCell>
                              <TableCell>
                                {participant.registrationDate ? new Date(participant.registrationDate).toLocaleDateString('id-ID') : '-'}
                              </TableCell>
                              <TableCell>
                                <Badge variant={participant.status === 'approved' ? 'default' : 'secondary'}>
                                  {participant.status === 'approved' ? 'Disetujui' : participant.status || 'Pending'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleParticipantDelete(participant.id);
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                              {loading ? 'Memuat data...' : 'Belum ada data peserta'}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {selectedParticipant && (
                <Card>
                  <CardHeader>
                    <CardTitle>Detail Peserta</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedParticipant(null)}
                      className="absolute top-4 right-4"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-600">Nama</Label>
                      <p className="font-medium">{selectedParticipant.name}</p>
                    </div>
                    {selectedParticipant.nip && (
                      <div>
                        <Label className="text-gray-600">NIP</Label>
                        <p className="font-medium">{selectedParticipant.nip}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-gray-600">Tipe Peserta</Label>
                      <p className="font-medium">{selectedParticipant.participantType}</p>
                    </div>
                    {selectedParticipant.phone && (
                      <div>
                        <Label className="text-gray-600">Nomor HP</Label>
                        <p className="font-medium">{selectedParticipant.phone}</p>
                      </div>
                    )}
                    {selectedParticipant.address && (
                      <div>
                        <Label className="text-gray-600">Alamat</Label>
                        <p className="text-sm">{selectedParticipant.address}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-gray-600">Tanggal Pendaftaran</Label>
                      <p className="font-medium">
                        {selectedParticipant.registrationDate ? new Date(selectedParticipant.registrationDate).toLocaleString('id-ID') : '-'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Total Peserta</Label>
                      <p className="font-medium">{1 + (selectedParticipant.totalFamily || 0)} orang</p>
                    </div>
                    {selectedParticipant.totalFamily > 0 && (
                      <div className="border-t pt-4 mt-4">
                        <Label className="text-gray-600 mb-2 block">Anggota Keluarga</Label>
                        <div className="space-y-2 text-sm">
                          {Array.isArray(selectedParticipant.familyMembers) && selectedParticipant.familyMembers.map((fm: any, idx: number) => (
                            <div key={fm.id || idx} className="bg-gray-50 p-2 rounded">
                              <div className="font-medium">{fm.name}</div>
                              <div className="text-gray-600">{fm.relationship}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="pt-4 border-t">
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => handleParticipantDelete(selectedParticipant.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus Peserta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification">
            <Card>
              <CardHeader>
                <CardTitle>Verifikasi Daftar Ulang</CardTitle>
                <CardDescription>Verifikasi peserta yang sudah mendaftar ulang</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Cari peserta..."
                      className="w-full"
                    />
                  </div>
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Disetujui</SelectItem>
                      <SelectItem value="rejected">Ditolak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Keluarga</TableHead>
                        <TableHead>Tanggal Daftar Ulang</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>DP</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(reregistrations) && reregistrations.filter(r => r.status === 'pending').length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                            Tidak ada daftar ulang yang perlu diverifikasi
                          </TableCell>
                        </TableRow>
                      ) : (
                        Array.isArray(reregistrations) && reregistrations.filter(r => r.status === 'pending').map((rereg) => (
                          <TableRow key={rereg.id}>
                            <TableCell className="font-medium">{rereg.participantName}</TableCell>
                            <TableCell>
                              <Badge variant={rereg.participantType === 'ASN' ? 'default' : 'secondary'}>
                                {rereg.participantType}
                              </Badge>
                            </TableCell>
                            <TableCell>{rereg.totalFamily + 1} orang</TableCell>
                            <TableCell>
                              {rereg.reregistrationDate ? new Date(rereg.reregistrationDate).toLocaleDateString('id-ID') : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">Pending</Badge>
                            </TableCell>
                            <TableCell>-</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  onClick={() => handleOpenVerification(rereg.participantId, rereg.participantName)}
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Setuju
                                </Button>
                                <Button
                                  onClick={() => handleRejectReregistration(rereg.participantId)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Verification Modal */}
            {verificationModal.isOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="max-w-md w-full">
                  <CardHeader>
                    <CardTitle className="text-xl">Verifikasi Daftar Ulang</CardTitle>
                    <CardDescription>
                      Setujui daftar ulang untuk: <strong>{verificationModal.participantName}</strong>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="mb-2 block">Nominal DP yang Diserahkan (Rp)</Label>
                      <Input
                        type="number"
                        value={verificationModal.dpAmount}
                        onChange={(e) => setVerificationModal({ ...verificationModal, dpAmount: e.target.value })}
                        placeholder="Contoh: 500000"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Masukkan nominal DP yang diserahkan oleh peserta
                      </p>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={handleCloseVerification}
                        variant="outline"
                        className="flex-1"
                        disabled={verificationModal.isApproving}
                      >
                        Batal
                      </Button>
                      <Button
                        onClick={handleApproveReregistration}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        disabled={verificationModal.isApproving}
                      >
                        {verificationModal.isApproving ? 'Memproses...' : 'Setujui'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Seat Allocation Tab */}
          <TabsContent value="seats" id="seats-content">
            <div className="space-y-6" id="print-content">
              {/* Header with Print Button (hidden during print) */}
              <div className="flex items-center justify-between no-print">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Pengaturan Kursi</CardTitle>
                  <CardDescription>Alokasi kursi peserta berdasarkan tujuan kota</CardDescription>
                </div>
                <Button onClick={handlePrintList} className="gap-2">
                  <Printer className="w-4 h-4" />
                  Cetak Daftar (A4)
                </Button>
              </div>

              {/* City Filter (hidden during print) */}
              <Card className="no-print">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Label>Filter Kota:</Label>
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Semua Kota" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Kota</SelectItem>
                        <SelectItem value="C-001">Semarang</SelectItem>
                        <SelectItem value="C-002">Surabaya</SelectItem>
                        <SelectItem value="C-003">Yogyakarta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Print Header (only visible during print) */}
              <div className="hidden print-block text-center mb-6">
                <h1 className="text-2xl font-bold mb-2">DAFTAR ALOKASI BUS & KURSI</h1>
                <p className="text-gray-600">Program Mudik Gratis KORPRI BMKG 2025</p>
                <p className="text-sm text-gray-500 mt-2">Dicetak: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              {/* Bus Allocations by City */}
              {(() => {
                const filteredAllocations = selectedCity === 'all' 
                  ? seatAllocations 
                  : seatAllocations.filter(b => b.cityId === selectedCity);
                
                // Group by city
                const groupedByCity = filteredAllocations.reduce((acc: any, bus: any) => {
                  if (!acc[bus.cityId]) {
                    acc[bus.cityId] = {
                      cityName: bus.cityName,
                      buses: [],
                    };
                  }
                  acc[bus.cityId].buses.push(bus);
                  return acc;
                }, {});

                return (
                  <>
                    {Object.entries(groupedByCity).map(([cityId, cityData]: [string, any]) => (
                      <div key={cityId} className="space-y-4">
                        {/* City Header */}
                        <div className="flex items-center gap-2 page-break">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          <h3 className="text-xl font-bold text-gray-900">{cityData.cityName}</h3>
                          <Badge variant="secondary">{cityData.buses.length} Bus</Badge>
                        </div>

                        {/* Buses in this city */}
                        <div className="space-y-4">
                          {cityData.buses.map((bus: any) => (
                            <Card key={bus.id} className="border border-gray-200">
                              <CardHeader className="bg-blue-50 pb-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                      <Bus className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <CardTitle className="text-lg">{bus.busNumber}</CardTitle>
                                      <CardDescription>
                                        Kapasitas: {bus.capacity} kursi | Terpakai: {bus.participants.length} peserta
                                      </CardDescription>
                                    </div>
                                  </div>
                                  <Badge variant={bus.participants.length >= bus.capacity ? "destructive" : "default"}>
                                    {bus.participants.length >= bus.capacity ? "Penuh" : "Tersedia"}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  {bus.participants.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                      Belum ada peserta yang dialokasikan
                                    </div>
                                  ) : (
                                    bus.participants.map((participant: any, idx: number) => (
                                      <div 
                                        key={participant.participantId}
                                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-700">
                                                {idx + 1}
                                              </div>
                                              <div>
                                                <h4 className="font-semibold text-gray-900">{participant.name}</h4>
                                                <p className="text-sm text-gray-500">
                                                  {participant.familyMembers + 1} orang (termasuk pendaftar)
                                                </p>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                              <div className="flex items-center gap-1">
                                                <Armchair className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600">Kursi: </span>
                                                <span className="font-medium text-gray-900">{participant.seats.join(', ')}</span>
                                              </div>
                                              <Badge variant="outline" className="text-xs">
                                                {participant.status === 'approved' ? 'Terverifikasi' : 'Pending'}
                                              </Badge>
                                            </div>
                                          </div>
                                          <div className="flex gap-2 no-print">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => handleGenerateQR(participant, bus.busNumber)}
                                              className="gap-1"
                                            >
                                              <QrCode className="w-4 h-4" />
                                              QR
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}

                    {filteredAllocations.length === 0 && (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <Bus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Tidak ada data alokasi kursi untuk kota ini</p>
                        </CardContent>
                      </Card>
                    )}
                  </>
                );
              })()}
            </div>
          </TabsContent>

          {/* Report Tab - Proposal untuk Sponsor */}
          <TabsContent value="report">
            {!reportData ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Memuat data...</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6" id="report-content">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Laporan Proposal Sponsor</CardTitle>
                    <CardDescription>Data lengkap program mudik gratis untuk proposal ke sponsor</CardDescription>
                  </div>
                  <div className="flex gap-3 no-print">
                    <Button onClick={handleGenerateReport} disabled={loading} variant="outline" className="gap-2">
                      <RefreshCw className="w-4 h-4" />
                      {loading ? 'Memuat...' : 'Refresh Data'}
                    </Button>
                    <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                      <Printer className="w-4 h-4" />
                      Cetak PDF (A4)
                    </Button>
                  </div>
                </div>

                {/* Halaman 1: Charts */}
                <Card className="no-print">
                  <CardHeader>
                    <CardTitle>Ringkasan Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Pie Chart: ASN vs Non-ASN */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Komposisi Peserta</h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'ASN', value: reportData.totalASNs, fill: '#3b82f6' },
                                  { name: 'Non-ASN', value: reportData.totalNonASNs, fill: '#10b981' },
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                <Tooltip />
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Bar Chart: Peserta per Kota */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Peserta per Kota</h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reportData.cities}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                              <YAxis />
                              <Tooltip 
                                formatter={(value) => `${value} peserta`}
                                contentStyle={{ fontSize: '10px' }}
                              />
                              <Bar 
                                dataKey="totalParticipants" 
                                fill="#3b82f6" 
                                name="Jumlah Peserta"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Bar Chart: Bus per Kota */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Bus per Kota</h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reportData.cities}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                              <YAxis />
                              <Tooltip 
                                formatter={(value) => `${value} bus`}
                                contentStyle={{ fontSize: '10px' }}
                              />
                              <Bar 
                                dataKey="totalBuses" 
                                fill="#059669" 
                                name="Jumlah Bus"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Halaman 2: Detail Peserta per Kota */}
                <div className="space-y-4 page-break-before-always">
                  {Array.isArray(reportData.cities) && reportData.cities.map((city: any, cityIndex: number) => (
                    <Card key={city.id}>
                      <CardHeader className="bg-blue-50 pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-900">{city.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {city.province} • {city.totalParticipants} peserta • {city.totalBuses} bus
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="secondary">{city.totalASNs} ASN</Badge>
                            <Badge variant="outline">{city.totalNonASNs} Non-ASN</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        {city.participants.length === 0 ? (
                          <div className="text-center py-6 text-gray-500 text-sm">
                            Tidak ada peserta untuk kota ini
                          </div>
                        ) : (
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-blue-600 text-white">
                                  <TableHead className="font-semibold text-white">No</TableHead>
                                  <TableHead className="font-semibold text-white">NIP</TableHead>
                                  <TableHead className="font-semibold text-white">Nama</TableHead>
                                  <TableHead className="font-semibold text-white">Tipe</TableHead>
                                  <TableHead className="font-semibold text-white">Keluarga</TableHead>
                                  <TableHead className="font-semibold text-white">Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {city.participants.map((participant: any, idx: number) => (
                                  <TableRow key={participant.id} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                                    <TableCell className="font-medium text-center">{idx + 1}</TableCell>
                                    <TableCell className="text-xs">{participant.nip || '-'}</TableCell>
                                    <TableCell className="font-medium">{participant.name}</TableCell>
                                    <TableCell>
                                      <Badge variant={participant.participantType === 'ASN' ? 'default' : 'secondary'}>
                                        {participant.participantType}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">{participant.totalFamily}</TableCell>
                                    <TableCell>
                                      <Badge variant={participant.status === 'approved' ? 'default' : 'secondary'}>
                                        {participant.status === 'approved' ? 'Terverifikasi' : 'Pending'}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Summary Footer */}
                <Card className="no-print">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Total Peserta</p>
                        <p className="text-3xl font-bold text-blue-600">{reportData.totalParticipants}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Total ASN</p>
                        <p className="text-3xl font-bold text-emerald-600">{reportData.totalASNs}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Total Non-ASN</p>
                        <p className="text-3xl font-bold text-purple-600">{reportData.totalNonASNs}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Total Bus</p>
                        <p className="text-3xl font-bold text-orange-600">{reportData.totalBuses}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Print Styles */}
            <style jsx global>{`
              @media print {
                .no-print { display: none !important; }
                body { background: white; }
                .page-break-before-always { page-break-before: always; }
                @page { size: A4; margin: 1cm; }
                table { width: 100%; page-break-inside: avoid; }
                th { background-color: #2563eb !important; color: white; }
                td { font-size: 9pt; padding: 6px 3px; }
                .card { page-break-inside: avoid; }
              }
            `}</style>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              {/* Pengaturan Waktu Event */}
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Waktu Event</CardTitle>
                  <CardDescription>Atur waktu pendaftaran dan daftar ulang</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Judul Event */}
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900">Judul Event</h3>
                    <div>
                      <Label className="mb-2 block">Judul Event (akan muncul di halaman depan)</Label>
                      <Input
                        type="text"
                        value={settings.eventTitle}
                        onChange={(e) => setSettings({ ...settings, eventTitle: e.target.value })}
                        placeholder="Contoh: MUDIK GRATIS KORPRI BMKG 2025"
                      />
                    </div>
                  </div>

                  {/* Periode Pendaftaran */}
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900">Periode Pendaftaran</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-2 block">Tanggal Buka Pendaftaran</Label>
                        <Input
                          type="date"
                          value={settings.registrationOpenDate}
                          onChange={(e) => setSettings({ ...settings, registrationOpenDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">Tanggal Tutup Pendaftaran</Label>
                        <Input
                          type="date"
                          value={settings.registrationCloseDate}
                          onChange={(e) => setSettings({ ...settings, registrationCloseDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Periode Daftar Ulang */}
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900">Periode Daftar Ulang</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-2 block">Tanggal Buka Daftar Ulang</Label>
                        <Input
                          type="date"
                          value={settings.reregistrationOpenDate}
                          onChange={(e) => setSettings({ ...settings, reregistrationOpenDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">Tanggal Tutup Daftar Ulang</Label>
                        <Input
                          type="date"
                          value={settings.reregistrationCloseDate}
                          onChange={(e) => setSettings({ ...settings, reregistrationCloseDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Event Status */}
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900">Event Status</h3>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="event-active"
                        checked={settings.eventActive}
                        onChange={(e) => setSettings({ ...settings, eventActive: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Label htmlFor="event-active" className="text-sm font-medium">
                        Event Aktif
                      </Label>
                    </div>
                  </div>

                  {/* Tampilan Halaman Utama */}
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900">Tampilan Halaman Utama</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="show-rereg-banner"
                          checked={settings.showReregBanner}
                          onChange={(e) => setSettings({ ...settings, showReregBanner: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <Label htmlFor="show-rereg-banner" className="text-sm font-medium">
                          Tampilkan Banner Daftar Ulang
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="show-bus-check-banner"
                          checked={settings.showBusCheckBanner}
                          onChange={(e) => setSettings({ ...settings, showBusCheckBanner: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <Label htmlFor="show-bus-check-banner" className="text-sm font-medium">
                          Tampilkan Banner Cek Bus
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-4">
                    <Button
                      onClick={handleSaveSettings}
                      disabled={loading}
                      className="bg-gray-900 hover:bg-gray-800"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* QR Code Section */}
              <Card>
                <CardHeader>
                  <CardTitle>QR Code untuk Daftar Ulang</CardTitle>
                  <CardDescription>Share QR code ini untuk memudahkan peserta mendaftar ulang</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4 py-8">
                  {/* QR Code Placeholder */}
                  <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-32 h-32"
                          viewBox="0 0 100 100"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect x="10" y="10" width="25" height="25" fill="black" />
                          <rect x="65" y="10" width="25" height="25" fill="black" />
                          <rect x="10" y="65" width="25" height="25" fill="black" />
                          <rect x="40" y="40" width="20" height="20" fill="black" />
                          <rect x="40" y="10" width="20" height="10" fill="black" />
                          <rect x="10" y="40" width="10" height="20" fill="black" />
                          <rect x="65" y="40" width="25" height="10" fill="black" />
                          <rect x="80" y="40" width="10" height="20" fill="black" />
                          <rect x="40" y="80" width="10" height="10" fill="black" />
                          <rect x="65" y="65" width="10" height="10" fill="black" />
                          <rect x="80" y="80" width="10" height="10" fill="black" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <p className="text-lg font-semibold text-gray-900">Scan QR Code Ini</p>

                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download QR
                    </Button>
                    <Button variant="outline" size="sm">
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}