'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { CSSProperties } from 'react';
import { useForm } from 'react-hook-form';
import { useStudentProfile, useUpdateStudentProfile } from '@/hooks/useProfile';
import type { ProfileUpdate } from '@/types/api';

const inputStyle: CSSProperties = {
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-hover)',
  padding: '8px 10px',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-sm)',
  width: '100%',
};

const labelStyle: CSSProperties = {
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--color-text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const getStudentId = (value: string | string[] | undefined) => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0] ?? '';
  return '';
};

const toNullableNumber = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export default function StudentProfilePage() {
  const params = useParams();
  const studentId = getStudentId(params.studentId);
  const profileQuery = useStudentProfile(studentId);
  const updateProfile = useUpdateStudentProfile(studentId);

  const { register, handleSubmit, reset } = useForm<ProfileUpdate>({
    defaultValues: {},
  });

  useEffect(() => {
    if (profileQuery.data) {
      reset({
        group_type: profileQuery.data.group_type ?? 'D',
        course_year: profileQuery.data.course_year ?? 2,
        gpa: profileQuery.data.gpa ? Number(profileQuery.data.gpa) : null,
        ielts_passed: profileQuery.data.ielts_passed ?? false,
        ielts_score: profileQuery.data.ielts_score ? Number(profileQuery.data.ielts_score) : null,
        sat_passed: profileQuery.data.sat_passed ?? false,
        sat_score: profileQuery.data.sat_score ?? null,
        target_country: profileQuery.data.target_country ?? null,
        target_major: profileQuery.data.target_major ?? null,
        notes: profileQuery.data.notes ?? null,
      });
    }
  }, [profileQuery.data, reset]);

  if (profileQuery.isLoading) {
    return <div style={{ color: 'var(--color-text-secondary)' }}>Loading profile...</div>;
  }

  if (!profileQuery.data) {
    return <div style={{ color: 'var(--color-text-secondary)' }}>Profile not available.</div>;
  }

  const onSubmit = handleSubmit((values) => {
    updateProfile.mutate({
      group_type: values.group_type ?? null,
      course_year: toNullableNumber(values.course_year),
      gpa: toNullableNumber(values.gpa),
      ielts_passed: values.ielts_passed ?? null,
      ielts_score: toNullableNumber(values.ielts_score),
      sat_passed: values.sat_passed ?? null,
      sat_score: toNullableNumber(values.sat_score),
      target_country: values.target_country ?? null,
      target_major: values.target_major ?? null,
      notes: values.notes ?? null,
    });
  });

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div>
          <label style={labelStyle}>Group</label>
          <select style={inputStyle} {...register('group_type')}>
            <option value="D">D</option>
            <option value="F">F</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Course Year</label>
          <select style={inputStyle} {...register('course_year')}>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>GPA</label>
          <input type="number" step="0.1" style={inputStyle} {...register('gpa')} />
        </div>
        <div>
          <label style={labelStyle}>IELTS Passed</label>
          <input type="checkbox" style={{ marginTop: 8 }} {...register('ielts_passed')} />
        </div>
        <div>
          <label style={labelStyle}>IELTS Score</label>
          <input type="number" step="0.1" style={inputStyle} {...register('ielts_score')} />
        </div>
        <div>
          <label style={labelStyle}>SAT Passed</label>
          <input type="checkbox" style={{ marginTop: 8 }} {...register('sat_passed')} />
        </div>
        <div>
          <label style={labelStyle}>SAT Score</label>
          <input type="number" style={inputStyle} {...register('sat_score')} />
        </div>
        <div>
          <label style={labelStyle}>Target Country</label>
          <input style={inputStyle} {...register('target_country')} />
        </div>
        <div>
          <label style={labelStyle}>Target Major</label>
          <input style={inputStyle} {...register('target_major')} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Notes</label>
        <textarea rows={4} style={inputStyle} {...register('notes')} />
      </div>

      <button
        type="submit"
        disabled={updateProfile.isPending}
        style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid transparent',
          background: 'var(--color-primary)',
          color: '#fff',
          fontWeight: 'var(--font-semibold)',
          justifySelf: 'flex-start',
          opacity: updateProfile.isPending ? 0.7 : 1,
        }}
      >
        {updateProfile.isPending ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  );
}
