import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type MessageType = 'success' | 'error' | 'info';

@Component({
  selector: 'app-message-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-modal.html',
  styleUrls: ['./message-modal.css']
})
export class MessageModalComponent {
  @Input() isOpen: boolean = false;
  @Input() messageType: MessageType = 'info';
  @Input() message: string = '';
  @Output() close = new EventEmitter<void>();

  get icon(): string {
    switch (this.messageType) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  }

  get modalClass(): string {
    return `modal-${this.messageType}`;
  }

  closeModal(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }
}
