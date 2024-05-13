import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { setBackend } from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  WIDTH = 640;
  HEIGHT = 480;

  @ViewChild("video")
  public video!: ElementRef;

  error: any;
  predictionValue = [{
    class: '- - -',
    score: 0
  }];
  totalObjectsDetected = 0;
  dataLoading = false;
  model: cocoSsd.ObjectDetection | null = null; // Declare the model property

  async ngAfterViewInit() {
    await this.setupDevices();
    await this.loadModel();
  }

  async setupDevices() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment'
          }
        });
        if (stream) {
          this.video.nativeElement.srcObject = stream;
          this.video.nativeElement.play();
          this.error = null;
        } else {
          this.error = "You have no output video device";
        }
      } catch (e) {
        this.error = e;
      }
    }
  }

  async loadModel() {
    try {
      setBackend('webgl');
      this.model = await cocoSsd.load();
      console.log('Model loaded successfully');
    } catch (error) {
      console.error('Error loading model:', error);
      // Handle error
    }
  }

  async loadImageDetection() {
    if (!this.model) {
      this.model = await cocoSsd.load();
    }
    this.dataLoading = true;
    this.model.detect(this.video.nativeElement).then(predictions => {
      this.predictionValue = predictions;
      this.totalObjectsDetected = predictions.length
      this.dataLoading = false;
    });
  }

  stopCamera() {
    this.video.nativeElement.srcObject.getTracks().forEach(function (track: { stop: () => void; }) {
      track.stop();
    });
  }

  async startCamera() {
    await this.setupDevices();
  }
}
