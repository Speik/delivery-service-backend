import { nanoid } from 'nanoid';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as path from 'path';
import * as fs from 'fs/promises';

enum Destination {
  DISHES = 'dishes',
}

const STORAGE_DIRECTORY_NAME = 'storage';

@Injectable()
export class FileStorage {
  public static Destination = Destination;

  constructor(private configService: ConfigService) {}

  public async generatePaths() {
    const storagePath = this.getStoragePath();
    const isStorageExists = await this.checkDirectoryExists(storagePath);

    if (!isStorageExists) {
      await fs.mkdir(storagePath, { recursive: true });
    }

    for (const destination of Object.values(Destination)) {
      const destinationPath = path.join(storagePath, destination);

      const isDestinationExists = await this.checkDirectoryExists(
        destinationPath,
      );

      if (isDestinationExists) return;
      await fs.mkdir(destinationPath);
    }
  }

  /**
   * @returns generated file name with original extension
   * @throws when file could not be saved
   */
  public async save(
    file: MulterFile,
    destination: Destination,
  ): Promise<string> {
    const filename = this.generateFilename(file);
    const path = this.getDestinationPath(filename, destination);

    await fs.writeFile(path, file.buffer);
    return filename;
  }

  /**
   * @returns status if file deleted or not
   * @throws when file could not be deleted
   */
  public async delete(
    name: string,
    destination: Destination,
  ): Promise<boolean> {
    const path = this.getDestinationPath(name, destination);
    const isExists = await this.checkFileExists(name, destination);

    if (!isExists) {
      console.warn(
        `Couldn't delete ${destination}/${name} since it doesn't exists`,
      );

      return false;
    }

    await fs.unlink(path);
    return true;
  }

  /** @returns status if file exists or not */
  public async checkFileExists(
    targetName: string,
    destination: Destination,
  ): Promise<boolean> {
    const storagePath = this.getStoragePath();

    const directoryPath = path.join(storagePath, destination);
    const directoryFiles = await fs.readdir(directoryPath);

    return directoryFiles.some((filename) => filename === targetName);
  }

  public resolveFilePath(filename: string, destination: Destination): string {
    return path.join(STORAGE_DIRECTORY_NAME, destination, filename);
  }

  private generateFilename(file: MulterFile): string {
    const extension = path.extname(file.originalname);
    const name = nanoid();

    return name + extension;
  }

  private getDestinationPath(
    filename: string,
    destination: Destination,
  ): string {
    const storagePath = this.getStoragePath();
    return path.join(storagePath, destination, filename);
  }

  private getStoragePath() {
    const staticDirectoryPath = this.configService.get<string>(
      'STATIC_DIRECTORY_PATH',
    );

    if (!staticDirectoryPath) {
      throw new Error('Path to static directory is not defined');
    }

    return path.join(staticDirectoryPath, STORAGE_DIRECTORY_NAME);
  }

  private async checkDirectoryExists(path: string) {
    try {
      const stats = await fs.stat(path);
      return stats.isDirectory();
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      }

      throw error;
    }
  }
}
