import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import { 
  Users, Target, MapPin, TrendingUp, RefreshCw, 
  Activity, Calendar, Award, ChevronRight
} from 'lucide-react'

// Sample data - replace with actual Google Sheets API integration
const sampleData = {
  monthly: [
    { month: 'Jan', atendimentos: 6, alcance: 162 },
    { month: 'Fev', atendimentos: 49, alcance: 1247 },
    { month: 'Mar', atendimentos: 100, alcance: 3057 },
    { month: 'Abr', atendimentos: 93, alcance: 2833 },
    { month: 'Mai', atendimentos: 23, alcance: 833 },
  ],
  regional: [
    { name: 'Cariri', value: 60 },
    { name: 'Grande Fortaleza', value: 43 },
    { name: 'Sertão de Sobral', value: 50 },
    { name: '其他', value: 15 },
  ],
  cities: [
    { city: 'Sobral', count: 36 },
    { city: 'Crato', count: 34 },
    { city: 'Fortaleza', count: 26 },
    { city: 'Maranguape', count: 8 },
    { city: 'Massapê', count: 6 },
  ],
  totals: {
    atendimentos: 271,
    alcance: 8132,
    escolas: 11,
    meses: 5
  }
}

const COLORS = ['#1565c0', '#1976d2', '#42a5f5', '#90caf9']

function MetricCard({ icon: Icon, value, label, trend, color = 'primary' }) {
  return (
    <div className={`bg-gradient-to-br from-${color} to-secondary rounded-xl p-4 text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-2">
        <Icon size={24} className="opacity-90" />
        {trend && (
          <span className={`text-xs px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold mb-1">{value.toLocaleString('pt-BR')}</div>
      <div className="text-xs opacity-90">{label}</div>
    </div>
  )
}

function MonthlyChart({ data }) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Activity className="text-primary" size={20} />
        Atendimentos por Mês
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              formatter={(value) => [value.toLocaleString('pt-BR'), 'Atendimentos']}
            />
            <Bar dataKey="atendimentos" fill="#1565c0" radius={[4, 4, 0, 0]} name="Atendimentos" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function ReachChart({ data }) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingUp className="text-primary" size={20} />
        Alcance de Pessoas
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none' }}
              formatter={(value) => [value.toLocaleString('pt-BR'), 'Pessoas Alcançadas']}
            />
            <Line 
              type="monotone" 
              dataKey="alcance" 
              stroke="#1565c0" 
              strokeWidth={3}
              dot={{ fill: '#1565c0', strokeWidth: 2 }}
              name="Alcance"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function RegionalPie({ data }) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <MapPin className="text-primary" size={20} />
        Distribuição Regional
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function TopCities({ cities }) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Award className="text-primary" size={20} />
        Top 5 Cidades
      </h3>
      <div className="space-y-3">
        {cities.map((city, index) => (
          <div key={city.city} className="flex items-center gap-3">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              index === 0 ? 'bg-yellow-400 text-yellow-900' :
              index === 1 ? 'bg-gray-300 text-gray-800' :
              index === 2 ? 'bg-amber-600 text-white' :
              'bg-blue-100 text-blue-800'
            }`}>
              {index + 1}
            </span>
            <div className="flex-1">
              <div className="font-medium text-gray-800">{city.city}</div>
              <div className="text-xs text-gray-500">{city.count} atendimentos</div>
            </div>
            <div className="text-primary font-semibold">{city.count}x</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Header() {
  return (
    <header className="bg-gradient-to-r from-primary to-secondary text-white p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">DETRAN-CE</h1>
          <p className="text-xs opacity-90">Diretoria de Educação para o Trânsito</p>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-90">Atualizado em</div>
          <div className="text-sm font-semibold">{new Date().toLocaleDateString('pt-BR')}</div>
        </div>
      </div>
    </header>
  )
}

function BottomNav({ active, setActive }) {
  const items = [
    { id: 'home', icon: Activity, label: 'Início' },
    { id: 'charts', icon: BarChart, label: 'Gráficos' },
    { id: 'cities', icon: MapPin, label: 'Cidades' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around items-center z-50">
      {items.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setActive(id)}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
            active === id ? 'text-primary bg-blue-50' : 'text-gray-500'
          }`}
        >
          <Icon size={24} />
          <span className="text-xs font-medium">{label}</span>
        </button>
      ))}
    </nav>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(sampleData)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4 mx-auto"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <Header />
      
      <main className="p-4 max-w-lg mx-auto">
        {activeTab === 'home' && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <MetricCard 
                icon={Users} 
                value={data.totals.atendimentos} 
                label="Total Atendimentos"
              />
              <MetricCard 
                icon={Target} 
                value={data.totals.alcance} 
                label="Pessoas Alcançadas"
                color="green"
              />
              <MetricCard 
                icon={MapPin} 
                value={data.totals.cidades} 
                label="Cidades Atendidas"
                color="purple"
              />
              <MetricCard 
                icon={Calendar} 
                value={data.totals.meses} 
                label="Meses de Atividades"
                color="orange"
              />
            </div>

            <MonthlyChart data={data.monthly} />
            <ReachChart data={data.monthly} />
          </>
        )}

        {activeTab === 'charts' && (
          <>
            <MonthlyChart data={data.monthly} />
            <ReachChart data={data.monthly} />
            <RegionalPie data={data.regional} />
          </>
        )}

        {activeTab === 'cities' && (
          <TopCities cities={data.cities} />
        )}
      </main>

      <BottomNav active={activeTab} setActive={setActiveTab} />
    </div>
  )
}
