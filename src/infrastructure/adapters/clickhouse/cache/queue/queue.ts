/**
 * A generic class representing a Queue data structure.
 */
export class Queue<T> {

  private readonly _elements: T[];

  /**
   * Creates an empty Queue.
   */
  constructor() {
    this._elements = [];
  }

  /**
   * Adds an element to the end of the Queue.
   * @param element The element to enqueue.
   */
  public enqueue(element: T): void {
    this._elements.push(element);
  }

  /**
   * Removes and returns the element at the front of the Queue.
   * @returns The element removed from the Queue, or undefined if the Queue is empty.
   */
  public dequeue(): T | undefined {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._elements.shift();
  }

  /**
   * Returns the element at the front of the Queue without removing it.
   * @returns The element at the front of the Queue, or undefined if the Queue is empty.
   */
  public peek(): T | undefined {
    return this._elements[0];
  }

  /**
   * Checks if the Queue is empty.
   * @returns true if the Queue is empty, false otherwise.
   */
  public isEmpty(): boolean {
    return 0 === this._elements.length;
  }

  /**
   * Returns the number of elements in the Queue.
   * @returns The number of elements in the Queue.
   */
  public size(): number {
    return this._elements.length;
  }

  /**
   * Removes all elements from the Queue, making it empty.
   */
  public clear(): void {
    this._elements.length = 0;
  }

}
