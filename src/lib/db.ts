import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Building, ElectricityBill, Tenant, User } from "../types";

const STORAGE_PREFIX = "rentalms";
const USE_LOCAL_DB = import.meta.env.VITE_USE_LOCAL_DB === "true";

type Row = Building | Tenant | ElectricityBill | User | Record<string, unknown>;

let supabaseClient: SupabaseClient | null = null;

if (!USE_LOCAL_DB) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase URL and anon key are required when VITE_USE_LOCAL_DB=false",
    );
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey);
}

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function storageKey(table: string) {
  return `${STORAGE_PREFIX}:${table}`;
}

function loadTable<T extends Row>(table: string): T[] {
  const item = localStorage.getItem(storageKey(table));
  return item ? (JSON.parse(item) as T[]) : [];
}

function saveTable<T extends Row>(table: string, rows: T[]) {
  localStorage.setItem(storageKey(table), JSON.stringify(rows));
}

function applyFilter<T extends Row>(
  rows: T[],
  column: keyof T,
  value: unknown,
) {
  return rows.filter((row) => row[column] === value);
}

class LocalQuery<T extends Row> {
  private table: string;
  private selectedColumns: Array<keyof T> | null = null;
  private whereClauses: Array<[keyof T, unknown]> = [];

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string | Array<keyof T> = "*") {
    if (Array.isArray(columns)) {
      this.selectedColumns = columns;
    }
    return this;
  }

  eq(column: keyof T, value: unknown) {
    this.whereClauses.push([column, value]);
    return this;
  }

  private resolveRows(): T[] {
    let rows = loadTable<T>(this.table);
    if (this.whereClauses.length > 0) {
      rows = this.whereClauses.reduce(
        (filtered, [column, value]) => applyFilter(filtered, column, value),
        rows,
      );
    }
    return rows;
  }

  async maybe() {
    return this.select("*");
  }

  async then(onfulfilled: (value: T[]) => unknown) {
    return Promise.resolve(onfulfilled(this.resolveRows()));
  }

  async insert(records: Partial<T>[]) {
    const rows = loadTable<T>(this.table);
    const items = records.map((record) => {
      const item = {
        ...record,
        id: (record as any).id || createId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as T;
      return item;
    });
    saveTable(this.table, [...rows, ...items]);
    return { data: items };
  }

  async update(values: Partial<T>) {
    const rows = loadTable<T>(this.table);
    const updated: T[] = [];
    const result = rows.map((row) => {
      if (this.whereClauses.every(([column, value]) => row[column] === value)) {
        const next = {
          ...row,
          ...values,
          updated_at: new Date().toISOString(),
        } as T;
        updated.push(next);
        return next;
      }
      return row;
    });
    saveTable(this.table, result);
    return { data: updated };
  }

  async delete() {
    const rows = loadTable<T>(this.table);
    const remaining = rows.filter(
      (row) =>
        !this.whereClauses.every(([column, value]) => row[column] === value),
    );
    saveTable(this.table, remaining);
    const removed = rows.filter((row) =>
      this.whereClauses.every(([column, value]) => row[column] === value),
    );
    return { data: removed };
  }

  async get() {
    return this.resolveRows();
  }
}

class SupabaseQuery<T extends Row> {
  private table: string;
  private baseQuery: any;
  private query: any;
  private isExecuted = false;

  constructor(table: string) {
    this.table = table;
    this.baseQuery = supabaseClient!.from(table);
    this.query = this.baseQuery.select("*");
  }

  select(columns: string | Array<keyof T> = "*") {
    if (this.isExecuted) return this;
    if (Array.isArray(columns)) {
      this.query = this.baseQuery.select(columns.join(","));
    } else {
      this.query = this.baseQuery.select(columns);
    }
    return this;
  }

  eq(column: keyof T, value: unknown) {
    if (this.isExecuted) return this;
    this.query = this.query.eq(column as string, value);
    return this;
  }

  async maybe() {
    return this.select("*");
  }

  async then(onfulfilled: (value: T[]) => unknown) {
    if (this.isExecuted) {
      return Promise.resolve(onfulfilled(this.query));
    }
    if (this.query === this.baseQuery) {
      this.query = this.query.select("*");
    }
    this.isExecuted = true;
    const { data, error } = await this.query;
    if (error) throw error;
    return Promise.resolve(onfulfilled(data || []));
  }

  async insert(records: Partial<T>[]) {
    this.isExecuted = true;
    const { data, error } = await this.baseQuery.insert(records);
    if (error) throw error;
    return { data };
  }

  async update(values: Partial<T>) {
    this.isExecuted = true;
    const { data, error } = await this.query.update(values);
    if (error) throw error;
    return { data };
  }

  async delete() {
    this.isExecuted = true;
    const { data, error } = await this.query.delete();
    if (error) throw error;
    return { data };
  }

  async get() {
    if (this.isExecuted) {
      return this.query;
    }
    if (this.query === this.baseQuery) {
      this.query = this.query.select("*");
    }
    this.isExecuted = true;
    const { data, error } = await this.query;
    if (error) throw error;
    return data || [];
  }
}

export const supabase = {
  from<T extends Row>(table: string) {
    return USE_LOCAL_DB
      ? new LocalQuery<T>(table)
      : new SupabaseQuery<T>(table);
  },
};

export function initializeLocalSeed() {
  if (!USE_LOCAL_DB) return; // Skip seeding for Supabase

  const users = loadTable<User>("users");
  if (users.length === 0) {
    const user: User = {
      id: createId(),
      email: "owner@example.com",
      password: "password123",
      user_metadata: { full_name: "Property Owner" },
      created_at: new Date().toISOString(),
    };
    saveTable("users", [user]);
  }
}
