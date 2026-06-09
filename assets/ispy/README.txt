Drop your I Spy cover images here.

To add one on the home page, copy this block in index.html inside .ispy__scene:

  <a href="your-page.html" class="ispy-item ispy-item--back ispy-item--3" style="--rot: 0deg">
    <img src="assets/ispy/your-image.png" alt="" class="ispy-item__nobg" />
  </a>

Layer classes:
  ispy-item--back   = behind the "portfolio" title
  ispy-item--front  = in front of the title

Position: add ispy-item--3, ispy-item--4, etc. and set --w, top, left in css/styles.css
(or drag on the live site — position saves in the browser).

Use ispy-item__nobg for transparent PNGs, ispy-item__cutout for black backgrounds.
