const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/modules/pages/authentication/manage-website/manage-website.component.html');

let content = fs.readFileSync(filePath, 'utf8');

// Replace text color HEX input rows with RGB input rows
const textColorHexPattern = /<div class="hex-input-row">\s*<span class="hex-label">Hex<\/span>\s*<input type="text"\s*\[ngModel\]="textColorHex"\s*\(ngModelChange\)="onTextColorHexInput\(\$event\)"\s*placeholder="000000"\s*maxlength="7"\s*class="hex-input-field">\s*<\/div>\s*<button type="button" class="apply-color-btn" \(click\)="applyTextColor\(\)">Apply<\/button>/g;

const textColorRgbReplacement = `<!-- RGB Display Row with Preview and Editable Inputs -->
                            <div class="rgb-input-row" style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; justify-content: center;">
                              <div [ngStyle]="{width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #e0e0e0', background: selectedTextColorRgb, flexShrink: 0}"></div>
                              <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: #888;">
                                <i class="fa fa-eyedropper" style="font-size: 14px;"></i>
                              </div>
                            </div>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 10px;">
                              <div style="display: flex; flex-direction: column; align-items: center;">
                                <input type="number" min="0" max="255" [(ngModel)]="textColorR" (ngModelChange)="onTextRgbInput('r', $event)" style="width: 48px; height: 32px; text-align: center; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;">
                                <span style="font-size: 11px; color: #888; margin-top: 4px;">R</span>
                              </div>
                              <div style="display: flex; flex-direction: column; align-items: center;">
                                <input type="number" min="0" max="255" [(ngModel)]="textColorG" (ngModelChange)="onTextRgbInput('g', $event)" style="width: 48px; height: 32px; text-align: center; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;">
                                <span style="font-size: 11px; color: #888; margin-top: 4px;">G</span>
                              </div>
                              <div style="display: flex; flex-direction: column; align-items: center;">
                                <input type="number" min="0" max="255" [(ngModel)]="textColorB" (ngModelChange)="onTextRgbInput('b', $event)" style="width: 48px; height: 32px; text-align: center; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;">
                                <span style="font-size: 11px; color: #888; margin-top: 4px;">B</span>
                              </div>
                            </div>
                            <button type="button" class="apply-color-btn" (click)="applyTextColor()">Apply</button>`;

content = content.replace(textColorHexPattern, textColorRgbReplacement);

// Replace bg color HEX input rows with RGB input rows
const bgColorHexPattern = /<div class="hex-input-row">\s*<span class="hex-label">Hex<\/span>\s*<input type="text"\s*\[ngModel\]="bgColorHex"\s*\(ngModelChange\)="onBgColorHexInput\(\$event\)"\s*placeholder="(?:000000|FFFFFF)"\s*maxlength="7"\s*class="hex-input-field">\s*<\/div>\s*<button type="button" class="apply-color-btn" \(click\)="applyBgColor\(\)">Apply<\/button>/g;

const bgColorRgbReplacement = `<!-- RGB Display Row with Preview and Editable Inputs -->
                            <div class="rgb-input-row" style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; justify-content: center;">
                              <div [ngStyle]="{width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #e0e0e0', background: selectedBgColorRgb, flexShrink: 0}"></div>
                              <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: #888;">
                                <i class="fa fa-eyedropper" style="font-size: 14px;"></i>
                              </div>
                            </div>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 10px;">
                              <div style="display: flex; flex-direction: column; align-items: center;">
                                <input type="number" min="0" max="255" [(ngModel)]="bgColorR" (ngModelChange)="onBgRgbInput('r', $event)" style="width: 48px; height: 32px; text-align: center; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;">
                                <span style="font-size: 11px; color: #888; margin-top: 4px;">R</span>
                              </div>
                              <div style="display: flex; flex-direction: column; align-items: center;">
                                <input type="number" min="0" max="255" [(ngModel)]="bgColorG" (ngModelChange)="onBgRgbInput('g', $event)" style="width: 48px; height: 32px; text-align: center; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;">
                                <span style="font-size: 11px; color: #888; margin-top: 4px;">G</span>
                              </div>
                              <div style="display: flex; flex-direction: column; align-items: center;">
                                <input type="number" min="0" max="255" [(ngModel)]="bgColorB" (ngModelChange)="onBgRgbInput('b', $event)" style="width: 48px; height: 32px; text-align: center; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;">
                                <span style="font-size: 11px; color: #888; margin-top: 4px;">B</span>
                              </div>
                            </div>
                            <button type="button" class="apply-color-btn" (click)="applyBgColor()">Apply</button>`;

content = content.replace(bgColorHexPattern, bgColorRgbReplacement);

fs.writeFileSync(filePath, content, 'utf8');

console.log('Replacement complete!');
console.log('Remaining hex-input-row occurrences:', (content.match(/hex-input-row/g) || []).length);
