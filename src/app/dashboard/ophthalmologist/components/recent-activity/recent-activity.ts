import { Component } from '@angular/core';

@Component({
  selector: 'app-recent-activity',
  imports: [],
  templateUrl: './recent-activity.html',
  styleUrl: './recent-activity.scss',
})
export class RecentActivity {
  activities = [
    { text: 'Analysis completed for Patient #1234', time: '5 minutes ago' },
    { text: 'New images uploaded by Dr. Sarah', time: '15 minutes ago' },
    { text: 'Report shared with Dr. Mark Evans', time: '1 hour ago' },
    { text: 'Analysis completed for Patient #1225', time: '2 hours ago' },
  ];
}
