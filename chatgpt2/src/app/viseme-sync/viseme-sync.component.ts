import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { VisemeSyncService } from '../services/viseme-sync.service';

interface Viseme {
  audioOffset: number;
  visemeId: number;
  animation: string;
}

@Component({
  selector: 'app-viseme-sync',
  templateUrl: './viseme-sync.component.html',
  styleUrls: ['./viseme-sync.component.css']
})
export class VisemeSyncComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private images: { [key: string]: HTMLImageElement } = {};
  private visemes: Viseme[] = [];
  textInput: string = '';

  constructor(private visemeSyncService: VisemeSyncService) { }

  ngOnInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
  }

  synthesizeSpeech(): void {
    this.visemeSyncService.synthesizeSpeech(this.textInput)
      .then(() => {
        this.visemes = this.visemeSyncService.getVisemes();
        this.loadImages().then(() => {
          this.startAnimation();
        });
      })
      .catch(error => console.error('Error synthesizing speech:', error));
  }

  private loadImages(): Promise<void> {
    const visemeIds = Array.from({ length: 22 }, (_, i) => i.toString()); // Visemes from 0 to 21
    const promises = visemeIds.map(id => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = `assets/${id}.jpg`;
        img.onload = () => {
          this.images[id] = img;
          resolve();
        };
      });
    });

    return Promise.all(promises).then(() => { });
  }

  private startAnimation() {
    let visemeIndex = 0;

    this.visemeSyncService.playAudio();

    const update = () => {
      const audio = this.visemeSyncService.getAudio();
      const currentTime = audio ? audio.currentTime * 1000 : 0; // Convert to ms
      if (visemeIndex < this.visemes.length && currentTime >= this.visemes[visemeIndex].audioOffset) {
        const visemeId = this.visemes[visemeIndex].visemeId.toString();
        if (this.images[visemeId]) {
          this.drawViseme(visemeId);
        } else {
          console.warn(`Image for viseme ID ${visemeId} not found.`);
        }
        visemeIndex++;
      }
      requestAnimationFrame(update);
    };

    update();
  }

  private drawViseme(visemeId: string) {
    const img = this.images[visemeId];
    if (img) {
      this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      this.ctx.drawImage(img, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    } else {
      console.warn(`Image for viseme ID ${visemeId} not found.`);
    }
  }
}
