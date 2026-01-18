import { Component } from '@angular/core';

@Component({
  selector: 'app-styling-space',
  templateUrl: './styling-space.component.html',
  styleUrls: ['./styling-space.component.scss']
})
export class StylingSpaceComponent {
  items = [
    {
      title: 'Artist Editions Sinks - Yepsen & Salute >>',
      subtitle: 'KOHLER',
      content: 'This course will continue the discussion of Kohler\'s newest collaboration with Studio McGee.',
      isOpen: false
    },
    {
      title: 'Kohler Lighting Part 3 >>',
      subtitle: 'KOHLER',
      content: `This course will continue the discussion of Kohler's newest collaboration with Studio McGee.`,
      isOpen: false
    },
    {
      title: 'Elevated Vanities >>',
      subtitle: 'KOHLER',
      content: `This course will continue the discussion of Kohler's newest collaboration with Studio McGee.`,
      isOpen: false
    },
    {
      title: 'NEW Kohler Lighting Part 2 >>',
      subtitle: 'KOHLER',
      content: `This course will continue the discussion of Kohler's newest collaboration with Studio McGee.`,
      isOpen: false
    },
    {
      title: 'NEW Kohler Lighting >>',
      subtitle: 'KOHLER',
      content: `This course will continue the discussion of Kohler's newest collaboration with Studio McGee.`,
      isOpen: false
    },
  ];
}
