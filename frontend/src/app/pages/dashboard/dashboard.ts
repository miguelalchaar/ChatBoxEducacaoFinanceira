import { Component } from '@angular/core';
import { ChatWidget } from '../../_components/chat-widget/chat-widget';

@Component({
  selector: 'app-dashboard',
  imports: [ChatWidget],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {}
