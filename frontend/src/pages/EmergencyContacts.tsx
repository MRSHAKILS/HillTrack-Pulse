import { useState } from 'react'
import { Phone, Mail, Copy, MapPin, AlertCircle, CheckCircle2, User } from 'lucide-react'

interface Contact {
  role: string
  name: string
  phone: string
  email: string
}

interface ContactDatabase {
  [location: string]: Contact[]
}

// Hardcoded Emergency Contact Database
const CONTACT_DB: ContactDatabase = {
  "Jurachhari Valley": [
    {
      role: "Upazila Nirbahi Officer (UNO)",
      name: "Md. Rafiqul Islam",
      phone: "+880 1712-345678",
      email: "uno.jurachhari@gov.bd"
    },
    {
      role: "Boat Ambulance Station",
      name: "Jurachhari Lake Emergency",
      phone: "+880 1812-987654",
      email: "boat.emergency@jurachhari.org"
    },
    {
      role: "Police Station (OC)",
      name: "Inspector Kamal Hossain",
      phone: "+880 1912-456789",
      email: "oc.jurachhari@police.gov.bd"
    },
    {
      role: "Health Complex Officer",
      name: "Dr. Fatima Begum",
      phone: "+880 1612-345123",
      email: "health.jurachhari@dghs.gov.bd"
    },
    {
      role: "Fire Service",
      name: "Jurachhari Fire Station",
      phone: "+880 1512-789456",
      email: "fire.jurachhari@service.bd"
    }
  ],
  "Baghaichhari Center": [
    {
      role: "Upazila Nirbahi Officer (UNO)",
      name: "Mrs. Ayesha Siddiqua",
      phone: "+880 1723-456789",
      email: "uno.baghaichhari@gov.bd"
    },
    {
      role: "Emergency Medical Services",
      name: "Baghaichhari EMS",
      phone: "+880 1823-567890",
      email: "ems.baghaichhari@health.bd"
    },
    {
      role: "Police Station (OC)",
      name: "Inspector Salim Ahmed",
      phone: "+880 1923-678901",
      email: "oc.baghaichhari@police.gov.bd"
    },
    {
      role: "District Hospital",
      name: "Dr. Abdul Karim",
      phone: "+880 1623-789012",
      email: "hospital.baghaichhari@dghs.gov.bd"
    }
  ],
  "Rangamati Sadar": [
    {
      role: "Deputy Commissioner (DC)",
      name: "Mohammad Hasan",
      phone: "+880 1734-567890",
      email: "dc.rangamati@gov.bd"
    },
    {
      role: "District Hospital",
      name: "Dr. Nasreen Sultana",
      phone: "+880 1834-678901",
      email: "hospital.rangamati@dghs.gov.bd"
    },
    {
      role: "Police Superintendent",
      name: "SP Jamal Uddin",
      phone: "+880 1934-789012",
      email: "sp.rangamati@police.gov.bd"
    },
    {
      role: "Helicopter Evacuation",
      name: "Air Ambulance Service",
      phone: "+880 1634-890123",
      email: "heli.emergency@rangamati.org"
    },
    {
      role: "IEDCR Emergency Hotline",
      name: "Disease Control Center",
      phone: "+880 1534-901234",
      email: "emergency.iedcr@health.gov.bd"
    }
  ],
  "Kaptai Lake North": [
    {
      role: "Marine Police",
      name: "Inspector Rashid Khan",
      phone: "+880 1745-678901",
      email: "marine.kaptai@police.gov.bd"
    },
    {
      role: "Boat Rescue Team",
      name: "Kaptai Water Rescue",
      phone: "+880 1845-789012",
      email: "rescue.kaptai@emergency.bd"
    },
    {
      role: "Health Sub-Center",
      name: "Dr. Shirin Akter",
      phone: "+880 1645-890123",
      email: "health.kaptai@dghs.gov.bd"
    }
  ],
  "Belaichhari Remote": [
    {
      role: "Union Parishad Chairman",
      name: "Mr. Habibur Rahman",
      phone: "+880 1756-789012",
      email: "chairman.belaichhari@union.gov.bd"
    },
    {
      role: "Community Health Worker",
      name: "Nurse Taslima Khatun",
      phone: "+880 1856-890123",
      email: "chw.belaichhari@health.bd"
    },
    {
      role: "Emergency Coordination",
      name: "Belaichhari Emergency Hub",
      phone: "+880 1656-901234",
      email: "emergency.belaichhari@coord.bd"
    }
  ]
}

const EmergencyContacts = () => {
  const [selectedLocation, setSelectedLocation] = useState("Jurachhari Valley")
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null)

  const currentContacts = CONTACT_DB[selectedLocation] || []

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone)
    setCopiedPhone(phone)
    setTimeout(() => setCopiedPhone(null), 2000)
  }

  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl shadow-2xl p-8 border-4 border-red-400">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
              <AlertCircle className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white mb-2">EMERGENCY CONTACTS</h1>
              <p className="text-red-100 font-semibold">Quick access to critical emergency services in Chittagong Hill Tracts</p>
            </div>
          </div>

          {/* Location Selector */}
          <div className="mt-6">
            <label className="block text-white font-bold mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Select Your Current Location:
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full md:w-96 px-4 py-3 bg-white/90 backdrop-blur-sm border-2 border-red-300 rounded-xl text-gray-800 font-semibold focus:ring-4 focus:ring-red-300 focus:border-red-500 transition-all cursor-pointer text-lg"
            >
              {Object.keys(CONTACT_DB).map((location) => (
                <option key={location} value={location}>
                  📍 {location}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contact Cards Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Phone className="w-6 h-6 text-red-600" />
            Available Contacts in {selectedLocation}
          </h2>
          <span className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold shadow-md">
            {currentContacts.length} Services
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentContacts.map((contact, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-xl border-4 border-red-200 hover:border-red-400 transition-all transform hover:-translate-y-1 overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-red-500 to-rose-500 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-black text-white text-sm uppercase tracking-wide">
                    {contact.role}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4">{contact.name}</h4>

                {/* Phone Section */}
                <div className="mb-4">
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="flex-1 font-mono text-gray-800 font-semibold bg-gray-100 px-3 py-2 rounded-lg">
                      {contact.phone}
                    </span>
                    <button
                      onClick={() => handleCopyPhone(contact.phone)}
                      className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                      title="Copy phone number"
                    >
                      {copiedPhone === contact.phone ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {copiedPhone === contact.phone && (
                    <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Copied to clipboard!
                    </p>
                  )}
                </div>

                {/* Email Section */}
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">
                    Email Address
                  </label>
                  <button
                    onClick={() => handleEmailClick(contact.email)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                  >
                    <Mail className="w-4 h-4" />
                    Send Email
                  </button>
                  <p className="text-xs text-gray-500 mt-1 text-center">{contact.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Note */}
        <div className="mt-8 bg-yellow-500 border-4 border-yellow-600 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-yellow-900 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-black text-yellow-900 mb-2">⚠️ EMERGENCY PROTOCOL</h3>
              <ul className="text-yellow-900 font-semibold space-y-1 text-sm">
                <li>• In case of life-threatening emergency, call multiple contacts simultaneously</li>
                <li>• For boat ambulance, confirm GPS coordinates before departure</li>
                <li>• Keep this page bookmarked for offline access</li>
                <li>• Report medical emergencies to both UNO and Health Officer</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmergencyContacts
