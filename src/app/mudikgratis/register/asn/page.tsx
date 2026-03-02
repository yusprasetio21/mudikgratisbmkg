'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2, User, Users, MapPin, Bus, CheckCircle, Calendar, X } from 'lucide-react';

interface FamilyMember {
  id: string;
  relationship: string;
  name: string;
  phone: string;
  age: number;
}

interface City {
  id: string;
  name: string;
  province: string;
}

interface Bus {
  id: string;
  busNumber: string;
  cityName: string;
  capacity: number;
  available: number;
  departureDate: string;
}

interface Stop {
  id: string;
  name: string;
  order: number;
}

interface ASNEmployee {
  id: string;
  nip: string;
  nama: string;
  gelarDepan: string;
  gelarBelakang: string;
  jabatan: string;
  unitKerja: string;
  alamat: string;
  noHp: string;
  email: string;
  golongan: string;
}

export default function ASNRegistrationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBus, setSelectedBus] = useState('');
  const [selectedStop, setSelectedStop] = useState('');

  // Employee search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ASNEmployee[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<ASNEmployee | null>(null);
  const [searching, setSearching] = useState(false);

  // Participant data
  const [nip, setNip] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Family members
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  // Form for adding family member
  const [newFamilyMember, setNewFamilyMember] = useState<FamilyMember>({
    id: '',
    relationship: '',
    name: '',
    phone: '',
    age: 0,
  });

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      fetchBuses(selectedCity);
      fetchStops(selectedCity);
    } else {
      setBuses([]);
      setStops([]);
    }
  }, [selectedCity]);

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/mudikgratis/cities');
      if (response.ok) {
        const data = await response.json();
        setCities(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchBuses = async (cityId: string) => {
    try {
      const response = await fetch(`/api/mudikgratis/buses?cityId=${cityId}`);
      if (response.ok) {
        const data = await response.json();
        setBuses(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching buses:', error);
    }
  };

  const fetchStops = async (cityId: string) => {
    try {
      const response = await fetch(`/api/mudikgratis/stops/city/${cityId}`);
      if (response.ok) {
        const data = await response.json();
        setStops(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching stops:', error);
    }
  };

  const searchEmployee = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/asn-employees/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.data || []);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Error searching employee:', error);
    } finally {
      setSearching(false);
    }
  };

  const selectEmployee = (employee: ASNEmployee) => {
    // Format nama lengkap dengan gelar
    let fullName = employee.nama;
    if (employee.gelarDepan) {
      fullName = `${employee.gelarDepan} ${fullName}`;
    }
    if (employee.gelarBelakang) {
      fullName = `${fullName}, ${employee.gelarBelakang}`;
    }

    setSelectedEmployee(employee);
    setNip(employee.nip);
    setName(fullName);
    setAddress(employee.alamat || '');
    setPhone(employee.noHp || '');
    setSearchQuery(fullName);
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const clearEmployeeSelection = () => {
    setSelectedEmployee(null);
    setNip('');
    setName('');
    setAddress('');
    setPhone('');
    setSearchQuery('');
  };

  const addFamilyMember = () => {
    if (!newFamilyMember.relationship || !newFamilyMember.name) {
      alert('Harap lengkapi hubungan dan nama anggota keluarga');
      return;
    }

    if (familyMembers.length >= 5) {
      alert('Maksimal 5 anggota keluarga');
      return;
    }

    setFamilyMembers([
      ...familyMembers,
      {
        ...newFamilyMember,
        id: Date.now().toString(),
      },
    ]);

    setNewFamilyMember({
      id: '',
      relationship: '',
      name: '',
      phone: '',
      age: 0,
    });
  };

  const removeFamilyMember = (id: string) => {
    setFamilyMembers(familyMembers.filter((fm) => fm.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nip || !name || !selectedBus) {
      alert('Harap lengkapi data yang wajib diisi');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/mudikgratis/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          busId: selectedBus,
          stopId: selectedStop,
          participantType: 'ASN',
          name,
          nip,
          phone,
          address,
          familyMembers,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Store registration data in session storage for confirmation page
        sessionStorage.setItem('registrationData', JSON.stringify(data.data || data));
        router.push('/mudikgratis/confirmation');
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal mendaftar. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error registering:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const selectedBusData = buses.find((b) => b.id === selectedBus);
  const totalPeople = 1 + familyMembers.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/mudikgratis" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pendaftaran ASN</h1>
              <p className="text-gray-600">Lengkapi formulir pendaftaran mudik gratis</p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informasi Pribadi
              </CardTitle>
              <CardDescription>Cari data pegawai ASN atau isi manual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Employee Search */}
              <div className="space-y-2">
                <Label htmlFor="search-employee">
                  Cari Pegawai ASN (Nama atau NIP)
                </Label>
                <div className="relative">
                  <Input
                    id="search-employee"
                    placeholder="Ketik nama atau NIP (minimal 3 karakter)..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchEmployee(e.target.value);
                    }}
                    className="pr-10"
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {selectedEmployee && (
                    <button
                      type="button"
                      onClick={clearEmployeeSelection}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-50 w-full max-w-2xl mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                    {searchResults.map((employee) => (
                      <button
                        type="button"
                        key={employee.id}
                        onClick={() => selectEmployee(employee)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-gray-900">
                          {employee.nama}
                          {employee.gelarDepan && ` ${employee.gelarDepan}`}
                          {employee.gelarBelakang && `, ${employee.gelarBelakang}`}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">NIP:</span> {employee.nip}
                          {employee.jabatan && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{employee.jabatan}</span>
                            </>
                          )}
                        </div>
                        {employee.unitKerja && (
                          <div className="text-xs text-gray-500 mt-1">
                            {employee.unitKerja}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {showSearchResults && searchResults.length === 0 && !searching && (
                  <div className="absolute z-50 w-full max-w-2xl mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                    <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>Tidak ditemukan pegawai dengan nama atau NIP tersebut</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  {selectedEmployee 
                    ? 'Data pegawai ditemukan! Silakan verifikasi data di bawah ini.'
                    : 'Atau isi data secara manual di bawah ini:'}
                </p>

                <div>
                  <Label htmlFor="nip">
                    NIP <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nip"
                    placeholder="Masukkan NIP"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    required
                    readOnly={!!selectedEmployee}
                    className={selectedEmployee ? 'bg-gray-100' : ''}
                  />
                </div>
                <div className="mt-4">
                  <Label htmlFor="name">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Masukkan nama lengkap"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    readOnly={!!selectedEmployee}
                    className={selectedEmployee ? 'bg-gray-100' : ''}
                  />
                </div>
                <div className="mt-4">
                  <Label htmlFor="phone">Nomor HP</Label>
                  <Input
                    id="phone"
                    placeholder="08xxxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="mt-4">
                  <Label htmlFor="address">Alamat</Label>
                  <Textarea
                    id="address"
                    placeholder="Alamat lengkap"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className={selectedEmployee ? 'bg-gray-100' : ''}
                    readOnly={!!selectedEmployee}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Destination Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Pilih Tujuan
              </CardTitle>
              <CardDescription>Pilih kota tujuan dan bus</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="city">
                  Kota Tujuan <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kota tujuan" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}, {city.province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCity && (
                <div>
                  <Label htmlFor="bus">
                    Pilih Bus <span className="text-red-500">*</span>
                  </Label>
                  <Select value={selectedBus} onValueChange={setSelectedBus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih bus" />
                    </SelectTrigger>
                    <SelectContent>
                      {buses.map((bus) => (
                        <SelectItem
                          key={bus.id}
                          value={bus.id}
                          disabled={bus.available < totalPeople}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {bus.busNumber} - {bus.cityName}
                            </span>
                            <span className="text-sm text-gray-500">
                              {bus.available} kursi tersedia •{' '}
                              {bus.departureDate
                                ? new Date(bus.departureDate).toLocaleDateString(
                                    'id-ID',
                                    { day: 'numeric', month: 'long', year: 'numeric' }
                                  )
                                : 'Jadwal akan diinformasikan'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {buses.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Belum ada bus tersedia untuk kota ini
                    </p>
                  )}
                </div>
              )}

              {selectedCity && stops.length > 0 && (
                <div>
                  <Label htmlFor="stop">Kota Pemberhentian</Label>
                  <Select value={selectedStop} onValueChange={setSelectedStop}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kota pemberhentian" />
                    </SelectTrigger>
                    <SelectContent>
                      {stops.map((stop) => (
                        <SelectItem key={stop.id} value={stop.id}>
                          {stop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedBusData && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                    <Bus className="w-4 h-4" />
                    Informasi Bus
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Nomor Bus:</span>
                      <span className="ml-2 font-medium">{selectedBusData.busNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Kapasitas:</span>
                      <span className="ml-2 font-medium">{selectedBusData.capacity} kursi</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tersedia:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {selectedBusData.available} kursi
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Anda mendaftar:</span>
                      <span className="ml-2 font-medium">{totalPeople} orang</span>
                    </div>
                  </div>
                  {selectedBusData.available < totalPeople && (
                    <div className="mt-2 text-red-600 text-sm font-medium">
                      ⚠️ Kursi tidak mencukupi
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Family Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Anggota Keluarga
              </CardTitle>
              <CardDescription>
                Tambahkan anggota keluarga (maksimal 5 orang)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {familyMembers.length > 0 && (
                <div className="space-y-3">
                  {familyMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-600">
                          {member.relationship} {member.age > 0 && `• ${member.age} tahun`}
                          {member.phone && ` • ${member.phone}`}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFamilyMember(member.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {familyMembers.length < 5 && (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="fm-relationship">
                        Hubungan <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={newFamilyMember.relationship}
                        onValueChange={(value) =>
                          setNewFamilyMember({ ...newFamilyMember, relationship: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih hubungan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Suami/Istri">Suami/Istri</SelectItem>
                          <SelectItem value="Anak">Anak</SelectItem>
                          <SelectItem value="Ayah">Ayah</SelectItem>
                          <SelectItem value="Ibu">Ibu</SelectItem>
                          <SelectItem value="Saudara">Saudara</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="fm-name">
                        Nama <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fm-name"
                        placeholder="Nama lengkap"
                        value={newFamilyMember.name}
                        onChange={(e) =>
                          setNewFamilyMember({ ...newFamilyMember, name: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="fm-phone">Nomor HP</Label>
                      <Input
                        id="fm-phone"
                        placeholder="08xxxxxxxxxx"
                        value={newFamilyMember.phone}
                        onChange={(e) =>
                          setNewFamilyMember({ ...newFamilyMember, phone: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="fm-age">Usia</Label>
                      <Input
                        id="fm-age"
                        type="number"
                        placeholder="0"
                        min="0"
                        max="120"
                        value={newFamilyMember.age || ''}
                        onChange={(e) =>
                          setNewFamilyMember({
                            ...newFamilyMember,
                            age: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={addFamilyMember}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Anggota Keluarga ({familyMembers.length}/5)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-gradient-to-br from-blue-50 to-emerald-50 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Ringkasan Pendaftaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Peserta Utama:</span>
                  <span className="font-medium">{name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">NIP:</span>
                  <span className="font-medium">{nip || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Peserta:</span>
                  <span className="font-medium">{totalPeople} orang</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Anggota Keluarga:</span>
                  <span className="font-medium">{familyMembers.length} orang</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold text-blue-600">
                    <span>Total yang Didaftarkan:</span>
                    <span>{totalPeople} orang</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-6 text-lg"
            disabled={loading || !selectedBus || (selectedBusData && selectedBusData.available < totalPeople)}
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Dengan mendaftar, Anda menyetujui syarat dan ketentuan program mudik gratis
          </p>
        </form>
      </div>
    </div>
  );
}
