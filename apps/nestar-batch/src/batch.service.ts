import { Injectable } from '@nestjs/common';

@Injectable()
export class BatchService {
  getHello(): string {
    return 'Welcom to Nestar BATCH Server!';
  }

  public async batchRollback(): Promise<void> {
    console.log('BATCH ROLLBACK');
}
  public async batchProperties(): Promise<void> {
    console.log('BATCH TOP PROPERTIES');
}
  public async batchAgents(): Promise<void> {
    console.log('BATCH TOP AGENTS');
}
}
