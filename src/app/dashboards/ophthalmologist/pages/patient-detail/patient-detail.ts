import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DashboardSidebar } from '../../components/dashboard-sidebar/dashboard-sidebar';
import { DashboardNavbar } from '../../components/dashboard-navbar/dashboard-navbar';

export interface PatientData {
  id: string;
  name: string;
  gender: string;
  age: number;
  vision: string;
  lastUpload: string;
  dept: string;
  patientNr: string;
  avatar: string;
  eyeInfo: string[];
  eyePressure: number[];
  uploadHistory: { title: string; doctor: string; icon: 'list' | 'wave' | 'rx' }[];
  prescriptions: { name: string; frequency: string }[];
}

@Component({
  selector: 'app-patient-detail',
  imports: [DashboardSidebar, DashboardNavbar, RouterLink],
  templateUrl: './patient-detail.html',
  styleUrl: './patient-detail.scss',
})
export class PatientDetail implements OnInit {
  sidebarCollapsed = false;
  activeFilter = 'All';
  filters = ['All', 'Active', 'Pending', 'Completed'];
  patient: PatientData | null = null;

  private patientDatabase: Record<string, PatientData> = {
    '1': {
      id: '1', name: 'Emily Davis', gender: 'Female', age: 45, vision: '5.6 / 7',
      lastUpload: '2 days', dept: 'Ophthalmology', patientNr: 'P-12348', avatar: 'E',
      eyeInfo: ['No abnormalities', 'Pupil reaction normal', 'Pressure within range', 'Heart rate stable', 'Breath sounds clear', 'Reflexes intact', 'Skin temperature normal'],
      eyePressure: [16, 14, 17, 15, 18, 19, 20, 13, 12],
      uploadHistory: [
        { title: 'Eye image upload', doctor: 'Dr. Sarah Thompson', icon: 'list' },
        { title: 'Follow-up image', doctor: 'Dr. Mark Evans', icon: 'wave' },
        { title: 'Initial consultation notes', doctor: 'Dr. Emily Carter', icon: 'list' },
        { title: 'Prescription details', doctor: 'Dr. John Smith', icon: 'wave' },
      ],
      prescriptions: [
        { name: 'Latanoprost 0.005%', frequency: 'Prescribed daily' },
        { name: 'Timolol', frequency: 'As needed' },
      ],
    },
    '2': {
      id: '2', name: 'Michael Brown', gender: 'Male', age: 72, vision: '4.2 / 6',
      lastUpload: '5 days', dept: 'Retina', patientNr: 'P-12349', avatar: 'M',
      eyeInfo: ['Macular degeneration detected', 'Drusen deposits present', 'Central vision affected', 'Peripheral vision intact', 'Pressure slightly elevated'],
      eyePressure: [20, 22, 21, 19, 23, 21, 20, 22, 21],
      uploadHistory: [
        { title: 'Fundus photography', doctor: 'Dr. Sarah Thompson', icon: 'list' },
        { title: 'OCT scan results', doctor: 'Dr. Mark Evans', icon: 'wave' },
      ],
      prescriptions: [
        { name: 'Ranibizumab injection', frequency: 'Monthly' },
        { name: 'Vitamin supplements', frequency: 'Daily' },
      ],
    },
    '3': {
      id: '3', name: 'Sarah Wilson', gender: 'Female', age: 39, vision: '6.0 / 6',
      lastUpload: '1 day', dept: 'Vitreoretinal', patientNr: 'P-12350', avatar: 'S',
      eyeInfo: ['Retinal tear identified', 'Vitreous detachment noted', 'Laser treatment applied', 'Follow-up required', 'No new tears detected'],
      eyePressure: [14, 15, 13, 16, 14, 15, 13, 14, 15],
      uploadHistory: [
        { title: 'Retinal scan', doctor: 'Dr. Emily Carter', icon: 'list' },
        { title: 'Post-laser follow-up', doctor: 'Dr. John Smith', icon: 'wave' },
        { title: 'Vitreous assessment', doctor: 'Dr. Sarah Thompson', icon: 'list' },
      ],
      prescriptions: [
        { name: 'Prednisolone drops', frequency: '4x daily' },
        { name: 'Atropine 1%', frequency: 'As directed' },
      ],
    },
    '4': {
      id: '4', name: 'Jessica Taylor', gender: 'Female', age: 31, vision: '5.0 / 6',
      lastUpload: '10 days', dept: 'General', patientNr: 'P-12352', avatar: 'J',
      eyeInfo: ['Mild astigmatism', 'Corneal irregularity noted', 'Glasses prescription updated', 'No retinal issues'],
      eyePressure: [12, 13, 12, 14, 13, 12, 13, 12, 13],
      uploadHistory: [
        { title: 'Refraction test', doctor: 'Dr. Mark Evans', icon: 'list' },
        { title: 'Corneal topography', doctor: 'Dr. Emily Carter', icon: 'wave' },
      ],
      prescriptions: [
        { name: 'Artificial tears', frequency: 'As needed' },
      ],
    },
    '5': {
      id: '5', name: 'Olivia Anderson', gender: 'Female', age: 50, vision: '5.8 / 7',
      lastUpload: '3 days', dept: 'General', patientNr: 'P-12354', avatar: 'O',
      eyeInfo: ['Floaters present', 'No retinal tear', 'Vitreous syneresis', 'Monitor recommended'],
      eyePressure: [15, 16, 15, 17, 16, 15, 16, 15, 16],
      uploadHistory: [
        { title: 'Vitreous examination', doctor: 'Dr. John Smith', icon: 'list' },
        { title: 'Ultrasound B-scan', doctor: 'Dr. Sarah Thompson', icon: 'wave' },
      ],
      prescriptions: [
        { name: 'Observation only', frequency: 'Monitor 3 months' },
      ],
    },
    '6': {
      id: '6', name: 'James Hernandez', gender: 'Male', age: 37, vision: '3.5 / 6',
      lastUpload: '1 day', dept: 'Retina', patientNr: 'P-12355', avatar: 'J',
      eyeInfo: ['Retinitis pigmentosa confirmed', 'Peripheral vision loss', 'Night blindness reported', 'ERG abnormal', 'Genetic counseling advised'],
      eyePressure: [18, 17, 19, 18, 17, 18, 19, 17, 18],
      uploadHistory: [
        { title: 'ERG test results', doctor: 'Dr. Emily Carter', icon: 'wave' },
        { title: 'Visual field test', doctor: 'Dr. Mark Evans', icon: 'list' },
        { title: 'Genetic test report', doctor: 'Dr. John Smith', icon: 'rx' },
      ],
      prescriptions: [
        { name: 'Vitamin A palmitate', frequency: 'Daily' },
        { name: 'DHA supplement', frequency: 'Daily' },
      ],
    },
    '7': {
      id: '7', name: 'David Lee', gender: 'Male', age: 22, vision: '6.0 / 6',
      lastUpload: '1 day', dept: 'General', patientNr: 'P-12351', avatar: 'D',
      eyeInfo: ['Mild myopia', 'Corrective lenses prescribed', 'No retinal issues', 'Eye health normal', 'Annual review recommended'],
      eyePressure: [13, 12, 14, 13, 12, 13, 14, 12, 13],
      uploadHistory: [
        { title: 'Refraction assessment', doctor: 'Dr. Sarah Thompson', icon: 'list' },
        { title: 'Fundus examination', doctor: 'Dr. Mark Evans', icon: 'wave' },
      ],
      prescriptions: [
        { name: 'Corrective lenses -2.5', frequency: 'Daily wear' },
      ],
    },
    '8': {
      id: '8', name: 'William Martinez', gender: 'Male', age: 27, vision: '5.5 / 6',
      lastUpload: '2 days', dept: 'General', patientNr: 'P-12353', avatar: 'W',
      eyeInfo: ['Conjunctival redness', 'Bacterial infection suspected', 'Discharge present', 'Antibiotic drops prescribed', 'Follow-up in 1 week'],
      eyePressure: [14, 15, 14, 16, 15, 14, 15, 14, 15],
      uploadHistory: [
        { title: 'Slit lamp examination', doctor: 'Dr. Emily Carter', icon: 'list' },
        { title: 'Culture swab results', doctor: 'Dr. John Smith', icon: 'wave' },
      ],
      prescriptions: [
        { name: 'Chloramphenicol drops', frequency: '4x daily for 7 days' },
        { name: 'Lubricating eye drops', frequency: 'As needed' },
      ],
    },
    '9': {
      id: '9', name: 'James Hernandez', gender: 'Male', age: 37, vision: '3.5 / 6',
      lastUpload: '3 days', dept: 'Retina', patientNr: 'P-12355', avatar: 'J',
      eyeInfo: ['Treatment completed', 'Retinitis pigmentosa stable', 'No new progression', 'Vision aids recommended', 'Annual monitoring advised'],
      eyePressure: [17, 16, 18, 17, 16, 17, 18, 16, 17],
      uploadHistory: [
        { title: 'Final ERG assessment', doctor: 'Dr. Emily Carter', icon: 'wave' },
        { title: 'Discharge summary', doctor: 'Dr. Mark Evans', icon: 'list' },
        { title: 'Treatment completion report', doctor: 'Dr. John Smith', icon: 'rx' },
      ],
      prescriptions: [
        { name: 'Vitamin A palmitate', frequency: 'Daily - maintenance' },
        { name: 'DHA supplement', frequency: 'Daily' },
      ],
    },
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.patient = id ? (this.patientDatabase[id] ?? null) : null;
  }

  get maxPressure(): number {
    return Math.max(...(this.patient?.eyePressure ?? [1]));
  }

  getBarHeight(val: number): string {
    return `${(val / (this.maxPressure + 4)) * 100}%`;
  }

  toggleSidebar() { this.sidebarCollapsed = !this.sidebarCollapsed; }
}
