import { GameObject } from './GameObject';

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Collision {
  /**
   * Стандартне AABB (Axis-Aligned Bounding Box) перетинання
   */
  public static checkAABB(a: Box, b: Box): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  /**
   * Перевірка зіткнення з трикутним шипом (з чесним зменшеним хідбоксом як в оригінальному GD)
   */
  public static checkSpikeCollision(player: Box, spike: GameObject): boolean {
    // Внутрішній хідбокс шипа трохи менший за візуальний трикутник (запас 4-5 пікселів)
    const margin = 4;
    const spikeHitbox: Box = {
      x: spike.x + margin,
      y: spike.y + (spike.rotation === 180 ? 0 : margin),
      width: spike.width - margin * 2,
      height: spike.height - margin * 1.5
    };

    if (!this.checkAABB(player, spikeHitbox)) {
      return false;
    }

    // Додаткова перевірка форми трикутника
    // Якщо шип спрямований вгору (rotation 0)
    if (spike.rotation === 0) {
      const spikePeakX = spike.x + spike.width / 2;
      const playerCenterX = player.x + player.width / 2;
      const playerBottom = player.y;

      // Якщо гравець над верхівкою або збоку поза межами нахилу
      const dx = Math.abs(playerCenterX - spikePeakX);
      const halfWidth = (spike.width / 2) * (1 - (playerBottom - spike.y) / spike.height);
      if (playerBottom > spike.y && dx > halfWidth + margin) {
        return false;
      }
    }

    return true;
  }

  /**
   * Перевірка кругового перетинання (для сфер/Orbs та монет)
   */
  public static checkCircleBox(cx: number, cy: number, radius: number, box: Box): boolean {
    const closestX = Math.max(box.x, Math.min(cx, box.x + box.width));
    const closestY = Math.max(box.y, Math.min(cy, box.y + box.height));

    const distanceX = cx - closestX;
    const distanceY = cy - closestY;

    return (distanceX * distanceX + distanceY * distanceY) < (radius * radius);
  }
}
