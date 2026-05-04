export interface Building {
  id: string;
  name: string;
  address: string;
  total_rooms: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  building_id: string;
  name: string;
  phone: string;
  email?: string;
  aadhaar_number?: string;
  room_number: string;
  start_date: string;
  monthly_rent: number;
  deposit_amount: number;
  deposit_paid: number;
  unit_rate: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ElectricityBill {
  id: string;
  tenant_id: string;
  billing_month: string;
  previous_reading: number;
  current_reading: number;
  units_consumed: number;
  unit_rate: number;
  total_amount: number;
  is_paid: boolean;
  paid_date: string | null;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  user_metadata: {
    full_name: string;
  };
  created_at: string;
}
