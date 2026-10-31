# Build PanelPal logo SVGs. Wordmark text is outlined (no font needed).
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import os
OUT='/home/box/team/panelpal/design/logo'
INK='#0b0b0b'; BLUE='#2874d2'; TINT='#e5effa'; WHITE='#ffffff'; DARK='#0f1720'
f=TTFont('/usr/share/fonts/truetype/sand-box/google/Inter Tight/InterTight-VariableFont_wght.ttf')
f=instantiateVariableFont(f,{'wght':640})
gs=f.getGlyphSet(); cmap=f.getBestCmap(); upm=f['head'].unitsPerEm; hmtx=f['hmtx']
def text_path(s,size,x0,base,track=-0.02):
    sc=size/upm; x=0; ds=[]
    for ch in s:
        g=cmap[ord(ch)]; pen=SVGPathPen(gs)
        tp=TransformPen(pen,(sc,0,0,-sc,x0+x,base)); gs[g].draw(tp)
        ds.append(pen.getCommands()); x+=hmtx[g][0]*sc+track*size
    return ' '.join(ds), x-track*size
# ---- marks (64 grid) ----
def brackets(c,w=4):
    return (f'<g fill="none" stroke="{c}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round">'
            '<path d="M6 18V10a4 4 0 0 1 4-4h8"/><path d="M46 6h8a4 4 0 0 1 4 4v8"/>'
            '<path d="M58 46v8a4 4 0 0 1-4 4h-8"/><path d="M18 58h-8a4 4 0 0 1-4-4v-8"/></g>')
def mark_dial(fg=INK,acc=BLUE,bg=None):
    # A: scan brackets framing a gauge dial with a needle
    b=f'<rect width="64" height="64" rx="14" fill="{bg}"/>' if bg else ''
    return (b+brackets(fg)+
      f'<path d="M19.5 40a13 13 0 1 1 25 0" fill="none" stroke="{fg}" stroke-width="4" stroke-linecap="round"/>'
      f'<path d="M32 36 L41 25" stroke="{acc}" stroke-width="4.5" stroke-linecap="round"/>'
      f'<circle cx="32" cy="36" r="4" fill="{acc}"/>')
def mark_value(fg=INK,acc=BLUE,bg=None,tint=TINT):
    # B: scan brackets framing a screen with one boxed value (the camera view)
    b=f'<rect width="64" height="64" rx="14" fill="{bg}"/>' if bg else ''
    return (b+brackets(fg)+
      f'<rect x="15" y="19" width="34" height="26" rx="4" fill="none" stroke="{fg}" stroke-width="3.5"/>'
      f'<rect x="20" y="25" width="16" height="9" rx="1.5" fill="{tint}" stroke="{acc}" stroke-width="2.5"/>'
      f'<path d="M20 39.5h9" stroke="{fg}" stroke-width="2.5" stroke-linecap="round"/>'
      f'<circle cx="42" cy="29.5" r="2.5" fill="{acc}"/>')
def mark_cam(fg=INK,acc=BLUE,bg=None,body=WHITE):
    # C (chosen): the camera "pal". Landscape case on its clip mount; the lens is a dial with a blue needle.
    # v2 tidy: wider case and LED moved left so it does not read as a generic photo-app glyph at 16 px.
    b=f'<rect width="64" height="64" rx="14" fill="{bg}"/>' if bg else ''
    return (b+f'<rect x="6" y="11" width="52" height="34" rx="9" fill="{body}" stroke="{fg}" stroke-width="4"/>'
      f'<circle cx="32" cy="28" r="10" fill="none" stroke="{fg}" stroke-width="4"/>'
      f'<path d="M32 28 L38 22" stroke="{acc}" stroke-width="3.8" stroke-linecap="round"/>'
      f'<circle cx="32" cy="28" r="2.6" fill="{acc}"/>'
      f'<circle cx="14" cy="19" r="2.4" fill="{acc}"/>'
      f'<path d="M23 45v7a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-7" fill="none" stroke="{fg}" stroke-width="4" stroke-linejoin="round"/>')
MARKS={'a-dial':mark_dial,'b-value':mark_value,'c-cam':mark_cam}
def svg(w,h,body,label):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-label="{label}"><title>{label}</title>{body}</svg>\n'
def lockup(key,dark=False):
    fg=WHITE if dark else INK; acc='#5a9ae6' if dark else BLUE
    kw={'fg':fg,'acc':acc}
    if key=='b-value' and dark: kw['tint']='#1b3554'
    if key=='c-cam' and dark: kw['body']=DARK
    m=MARKS[key](**kw)
    size=44; h=64
    d1,w1=text_path('Panel',size,80,47)
    d2,w2=text_path('Pal',size,80+w1+size*-0.01,47)
    W=int(80+w1+w2+8)
    bg=f'<rect width="{W}" height="{h}" fill="{DARK}"/>' if dark else ''
    body=bg+m+f'<path d="{d1}" fill="{fg}"/><path d="{d2}" fill="{acc}"/>'
    return svg(W,h,body,'PanelPal')
os.makedirs(OUT,exist_ok=True)
for k in MARKS:
    d=f'{OUT}/{k}'; os.makedirs(d,exist_ok=True)
    open(f'{d}/lockup-horizontal-light.svg','w').write(lockup(k))
    open(f'{d}/lockup-horizontal-dark.svg','w').write(lockup(k,True))
    open(f'{d}/mark.svg','w').write(svg(64,64,MARKS[k](),'PanelPal mark'))
    open(f'{d}/mark-dark.svg','w').write(svg(64,64,MARKS[k](fg=WHITE,acc='#5a9ae6',**({'tint':'#1b3554'} if k=='b-value' else {'body':DARK} if k=='c-cam' else {})),'PanelPal mark'))
    # app icon / favicon: tile with blue background, white mark
    tile=MARKS[k](fg=WHITE,acc=WHITE,bg=BLUE,**({'tint':BLUE} if k=='b-value' else {'body':BLUE} if k=='c-cam' else {}))
    open(f'{d}/app-icon.svg','w').write(svg(64,64,tile,'PanelPal'))
# simplified favicon for A (thicker strokes, fewer parts)
fav=('<rect width="64" height="64" rx="14" fill="#2874d2"/>'
     '<g fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 20V8h12"/><path d="M44 8h12v12"/><path d="M56 44v12H44"/><path d="M20 56H8V44"/>'
     '<path d="M18 42a14 14 0 1 1 28 0"/></g><path d="M32 39 L42 27" stroke="#fff" stroke-width="6" stroke-linecap="round"/><circle cx="32" cy="39" r="5" fill="#fff"/>')
open(f'{OUT}/a-dial/favicon.svg','w').write(svg(64,64,fav,'PanelPal'))
print('ok')
# simplified favicon for C (chosen): blue tile, solid white camera case, bold dial lens, no small details
favc=('<rect width="64" height="64" rx="14" fill="#2874d2"/>'
      '<rect x="5" y="9" width="54" height="36" rx="10" fill="#fff"/>'
      '<circle cx="32" cy="27" r="11" fill="none" stroke="#2874d2" stroke-width="5.5"/>'
      '<path d="M32 27 L39 20" stroke="#2874d2" stroke-width="5.5" stroke-linecap="round"/>'
      '<path d="M22 45v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-8" fill="none" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>')
open(f'{OUT}/c-cam/favicon.svg','w').write(svg(64,64,favc,'PanelPal'))
print('ok c fav')
