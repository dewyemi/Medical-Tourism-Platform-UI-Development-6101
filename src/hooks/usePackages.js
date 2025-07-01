import useSWR from 'swr';
import supabase from '../lib/supabase';

const fetcher = async (key) => {
  const [, filters] = key;
  
  let query = supabase
    .from('packages')
    .select('*')
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters?.treatment_type) {
    query = query.ilike('treatment_type', `%${filters.treatment_type}%`);
  }
  
  if (filters?.price_min && filters?.price_max) {
    query = query.gte('price_usd', filters.price_min).lte('price_usd', filters.price_max);
  }
  
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,details.ilike.%${filters.search}%,treatment_type.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching packages:', error);
    // Return sample data as fallback
    return getSamplePackages(filters);
  }
  
  return data || getSamplePackages(filters);
};

// Sample packages data as fallback
const getSamplePackages = (filters = {}) => {
  const samplePackages = [
    {
      id: 1,
      title: 'Complete Dental Care Package',
      treatment_type: 'dental care',
      price_usd: 3500,
      duration_days: 7,
      details: 'Comprehensive dental treatment including cleaning, whitening, and minor procedures. Includes luxury hotel stay and all transfers.',
      thumbnail: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=400&h=250&fit=crop',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      title: 'Cosmetic Surgery Premium',
      treatment_type: 'cosmetic surgery',
      price_usd: 8500,
      duration_days: 14,
      details: 'Professional cosmetic procedures with world-class surgeons. Includes recovery accommodation and aftercare support.',
      thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop',
      created_at: '2024-01-02T00:00:00Z'
    },
    {
      id: 3,
      title: 'Cardiology Assessment Package',
      treatment_type: 'cardiology',
      price_usd: 4200,
      duration_days: 5,
      details: 'Complete cardiac evaluation with latest technology. Includes consultation, tests, and treatment recommendations.',
      thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop',
      created_at: '2024-01-03T00:00:00Z'
    },
    {
      id: 4,
      title: 'Orthopedic Treatment Excellence',
      treatment_type: 'orthopedics',
      price_usd: 6800,
      duration_days: 10,
      details: 'Joint replacement and orthopedic procedures with rehabilitation support. Includes physiotherapy sessions.',
      thumbnail: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=250&fit=crop',
      created_at: '2024-01-04T00:00:00Z'
    },
    {
      id: 5,
      title: 'Advanced Eye Care Package',
      treatment_type: 'eye care',
      price_usd: 2800,
      duration_days: 3,
      details: 'Advanced eye treatments including LASIK and cataract surgery. Same-day procedures available.',
      thumbnail: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=250&fit=crop',
      created_at: '2024-01-05T00:00:00Z'
    },
    {
      id: 6,
      title: 'Fertility Treatment Program',
      treatment_type: 'fertility',
      price_usd: 12000,
      duration_days: 21,
      details: 'Comprehensive fertility treatment with high success rates. Includes consultation, procedures, and follow-up care.',
      thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=250&fit=crop',
      created_at: '2024-01-06T00:00:00Z'
    },
    {
      id: 7,
      title: 'Oncology Care Package',
      treatment_type: 'oncology',
      price_usd: 15000,
      duration_days: 30,
      details: 'Comprehensive cancer treatment with world-class oncologists. Includes chemotherapy, radiation, and supportive care.',
      thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop',
      created_at: '2024-01-07T00:00:00Z'
    },
    {
      id: 8,
      title: 'General Surgery Package',
      treatment_type: 'general surgery',
      price_usd: 5500,
      duration_days: 8,
      details: 'Minimally invasive surgical procedures with experienced surgeons. Includes pre and post-operative care.',
      thumbnail: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&h=250&fit=crop',
      created_at: '2024-01-08T00:00:00Z'
    }
  ];

  // Apply filters to sample data
  let filtered = [...samplePackages];

  if (filters?.treatment_type) {
    filtered = filtered.filter(pkg => 
      pkg.treatment_type.toLowerCase().includes(filters.treatment_type.toLowerCase())
    );
  }

  if (filters?.price_min && filters?.price_max) {
    filtered = filtered.filter(pkg => 
      pkg.price_usd >= filters.price_min && pkg.price_usd <= filters.price_max
    );
  }

  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(pkg =>
      pkg.title.toLowerCase().includes(searchTerm) ||
      pkg.details.toLowerCase().includes(searchTerm) ||
      pkg.treatment_type.toLowerCase().includes(searchTerm)
    );
  }

  return filtered;
};

export const usePackages = (filters = {}) => {
  const { data, error, isLoading, mutate } = useSWR(
    ['packages', filters],
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    packages: data || [],
    isLoading,
    error,
    mutate
  };
};