export interface ITimetableEntry {
  id: string;
  timetableId: string;
  day: string[];
  startTime: string;
  endTime: string;
  subjectId: string;
  teacherId: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISection {
  id: string;
  name: string;
  classId: string;
  teacherId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ISession {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ITerm {
  id: string;
  name: string;
  sessionId: string;
  start_date: string;
  end_date: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ITimetable {
  id: string;
  schoolId: string;
  classId: string;
  sectionId: string;
  sessionId: string;
  termId: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  entries: ITimetableEntry[];
  section: ISection;
  session: ISession;
  term: ITerm;
  class: {
    id: string;
    name: string;
  }
}
