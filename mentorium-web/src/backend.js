import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase env vars missing for web. Set REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY (or VITE_*) in mentorium-web/.env',
  );
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

const demoStudentStats = {
  total_points: 850,
  current_streak: 3,
  longest_streak: 7,
  lessons_completed: 12,
  lessons_under_time: 8,
  average_efficiency: 6.2,
  last_activity: new Date().toISOString(),
  badges: [
    {
      type: 'first_mastery',
      name: 'First Mastery',
      description: 'Completed your first lesson',
      earned_at: new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      type: 'speed_demon',
      name: 'Speed Demon',
      description: 'Completed a lesson 20% faster than estimated',
      earned_at: new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
  ],
};

const demoLeaderboard = [
  {
    student_id: 'student_001',
    total_points: 2450,
    current_streak: 12,
    lessons_completed: 28,
    average_efficiency: 8.2,
  },
  {
    student_id: 'student_002',
    total_points: 1890,
    current_streak: 8,
    lessons_completed: 22,
    average_efficiency: 6.5,
  },
  {
    student_id: 'student_003',
    total_points: 1650,
    current_streak: 5,
    lessons_completed: 19,
    average_efficiency: 7.1,
  },
];

export async function fetchStudentStats(studentId) {
  if (!supabase) return demoStudentStats;

  try {
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', studentId)
      .single();

    if (statsError && statsError.code !== 'PGRST116') {
      throw statsError;
    }

    const { data: badges, error: badgesError } = await supabase
      .from('user_badges')
      .select('type, name, description, earned_at')
      .eq('user_id', studentId)
      .order('earned_at', { ascending: false })
      .limit(10);

    if (badgesError) {
      throw badgesError;
    }

    if (!stats) {
      return { ...demoStudentStats, badges: badges || demoStudentStats.badges };
    }

    return {
      total_points: stats.total_points ?? demoStudentStats.total_points,
      current_streak: stats.current_streak ?? demoStudentStats.current_streak,
      longest_streak: stats.longest_streak ?? demoStudentStats.longest_streak,
      lessons_completed:
        stats.lessons_completed ?? demoStudentStats.lessons_completed,
      lessons_under_time:
        stats.lessons_under_time ?? demoStudentStats.lessons_under_time,
      average_efficiency:
        stats.average_efficiency ?? demoStudentStats.average_efficiency,
      last_activity: stats.last_active ?? demoStudentStats.last_activity,
      badges: badges || demoStudentStats.badges,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching student stats from Supabase:', error);
    return demoStudentStats;
  }
}

export async function fetchLeaderboard(period = 'all', limit = 10) {
  if (!supabase) return demoLeaderboard;

  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select(
        'user_id, total_points, lessons_completed, current_streak, average_efficiency',
      )
      .order('total_points', { ascending: false })
      .limit(limit);

    if (error) throw error;
    if (!data) return demoLeaderboard;

    return data.map((row) => ({
      student_id: row.user_id,
      total_points: row.total_points ?? 0,
      current_streak: row.current_streak ?? 0,
      lessons_completed: row.lessons_completed ?? 0,
      average_efficiency: row.average_efficiency ?? 1.0,
    }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching leaderboard from Supabase:', error);
    return demoLeaderboard;
  }
}

export async function getTimeEstimate(studentId, skillId, subjectId) {
  if (!supabase) {
    return {
      estimated_minutes: 15,
      traditional_hours: 2,
      confidence: 0.5,
      mastery_level: 0.5,
      efficiency: 8,
    };
  }

  try {
    const { data, error } = await supabase.rpc('time_estimate', {
      student_id: studentId,
      skill_id: skillId,
      subject_id: subjectId,
    });

    if (error || !data) {
      throw error || new Error('No time_estimate data');
    }

    return {
      estimated_minutes: data.estimated_minutes ?? 15,
      traditional_hours: data.traditional_hours ?? 2,
      confidence: data.confidence ?? 0.5,
      mastery_level: data.mastery_level ?? 0.5,
      efficiency: data.efficiency ?? 8,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error getting time estimate:', error);
    return {
      estimated_minutes: 15,
      traditional_hours: 2,
      confidence: 0.5,
      mastery_level: 0.5,
      efficiency: 8,
    };
  }
}

export async function completeLessonBackend(payload) {
  if (!supabase) {
    return {
      streak: 0,
      new_badges: [],
    };
  }

  try {
    const { data, error } = await supabase.rpc('lesson_complete', payload);
    if (error) throw error;
    return {
      streak: data?.streak ?? 0,
      new_badges: data?.new_badges ?? [],
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error completing lesson via backend:', error);
    return {
      streak: 0,
      new_badges: [],
    };
  }
}

