import { Component } from '@angular/core';

@Component({
  selector: 'app-bathroom-faucets',
  templateUrl: './bathroom-faucets.component.html',
  styleUrls: ['./bathroom-faucets.component.scss']
})
export class BathroomFaucetsComponent {
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
