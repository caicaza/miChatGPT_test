import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-assistant-config',
  templateUrl: './assistant-config.component.html',
  styleUrls: ['./assistant-config.component.css']
})
export class AssistantConfigComponent {
  assistantName: string = '';
  instructions: string = '';
  selectedFile: File | null = null;

  private readonly uploadEndpoint = 'http://localhost:3000/api/upload-config';

  constructor(private http: HttpClient, private router: Router) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  saveConfig() {
    if (this.assistantName && this.instructions && this.selectedFile) {
      const formData = new FormData();
      formData.append('assistantName', this.assistantName);
      formData.append('instructions', this.instructions);
      formData.append('file', this.selectedFile, this.selectedFile.name);

      this.http.post(this.uploadEndpoint, formData).subscribe((response: any) => {
        console.log(response.message);
        this.router.navigate(['/chat']);
      }, (error) => {
        console.error('Error:', error);
      });
    }
  }
}
