import { query } from '../lib/database';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export class UserService {
  // Create a new user
  static async createUser(userData: CreateUserData): Promise<User | null> {
    try {
      const normalizedEmail = userData.email.trim().toLowerCase();
      const normalizedName = userData.name.trim();

      // Check if user already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [normalizedEmail]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Insert new user
      const result = await query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
        [normalizedName, normalizedEmail, hashedPassword]
      );

      return result.rows[0];
    } catch (error: unknown) {
      // Handle unique violation from DB
      const pgCode = (error as { code?: string } | undefined)?.code;
      if (pgCode === '23505') {
        throw new Error('User with this email already exists');
      }
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Find user by ID
  static async findById(id: number): Promise<User | null> {
    try {
      const result = await query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Verify user password
  static async verifyPassword(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.findByEmail(email.trim().toLowerCase());
      if (!user) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return null;
      }

      // Return user without password
      const { password: _unusedPassword, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }

  // Update user
  static async updateUser(id: number, updateData: Partial<CreateUserData>): Promise<User | null> {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (updateData.name) {
        fields.push(`name = $${paramCount}`);
        values.push(updateData.name);
        paramCount++;
      }

      if (updateData.email) {
        fields.push(`email = $${paramCount}`);
        values.push(updateData.email);
        paramCount++;
      }

      if (updateData.password) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(updateData.password, saltRounds);
        fields.push(`password = $${paramCount}`);
        values.push(hashedPassword);
        paramCount++;
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(id);
      const result = await query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user
  static async deleteUser(id: number): Promise<boolean> {
    try {
      const result = await query(
        'DELETE FROM users WHERE id = $1',
        [id]
      );

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Get all users (for admin purposes)
  static async getAllUsers(): Promise<User[]> {
    try {
      const result = await query(
        'SELECT id, name, email, created_at, updated_at FROM users ORDER BY created_at DESC'
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }
}
