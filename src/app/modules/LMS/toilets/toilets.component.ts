import { Component } from '@angular/core';

@Component({
  selector: 'app-toilets',
  templateUrl: './toilets.component.html',
  styleUrls: ['./toilets.component.scss']
})
export class ToiletsComponent {
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
