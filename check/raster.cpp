// Minimal depth-buffer renderer for offline geometry inspection (no WebGL).
#include <algorithm>
#include <cmath>
#include <vector>
extern "C" void raster(const float* tris,int n,int w,int h,unsigned char* rgb){
 std::vector<float> depth(w*h,-1e20f);
 for(int i=0;i<w*h;i++){rgb[i*3]=238;rgb[i*3+1]=233;rgb[i*3+2]=223;}
 for(int t=0;t<n;t++){
  const float* a=tris+t*18;const float* b=a+6;const float* c=a+12;
  float denom=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);
  if(std::abs(denom)<1e-8f)continue;
  int x0=std::max(0,(int)std::floor(std::min({a[0],b[0],c[0]}))),x1=std::min(w-1,(int)std::ceil(std::max({a[0],b[0],c[0]})));
  int y0=std::max(35,(int)std::floor(std::min({a[1],b[1],c[1]}))),y1=std::min(h-29,(int)std::ceil(std::max({a[1],b[1],c[1]})));
  for(int y=y0;y<=y1;y++)for(int x=x0;x<=x1;x++){
   float u=((b[1]-c[1])*(x+.5f-c[0])+(c[0]-b[0])*(y+.5f-c[1]))/denom;
   float v=((c[1]-a[1])*(x+.5f-c[0])+(a[0]-c[0])*(y+.5f-c[1]))/denom;
   float q=1-u-v;if(u<0||v<0||q<0)continue;
   float z=u*a[2]+v*b[2]+q*c[2];int p=y*w+x;if(z<=depth[p])continue;depth[p]=z;
   for(int k=0;k<3;k++)rgb[p*3+k]=(unsigned char)std::clamp(u*a[k+3]+v*b[k+3]+q*c[k+3],0.f,255.f);
  }
 }
}
// Texture sampling uses the shipped albedo maps and the exported runtime UVs.
extern "C" void raster_textured(const float* tris,int n,int w,int h,const unsigned char* textures,int textureSize,unsigned char* rgb){
 std::vector<float> depth(w*h,-1e20f);float lut[256];
 for(int i=0;i<256;i++){float c=i/255.f;lut[i]=c<=.04045f?c/12.92f:std::pow((c+.055f)/1.055f,2.4f);}
 for(int i=0;i<w*h;i++){rgb[i*3]=238;rgb[i*3+1]=233;rgb[i*3+2]=223;}
 for(int t=0;t<n;t++){
  const float* a=tris+t*27;const float* b=a+9;const float* c=a+18;
  float denom=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(std::abs(denom)<1e-8f)continue;
  int x0=std::max(0,(int)std::floor(std::min({a[0],b[0],c[0]}))),x1=std::min(w-1,(int)std::ceil(std::max({a[0],b[0],c[0]})));
  int y0=std::max(35,(int)std::floor(std::min({a[1],b[1],c[1]}))),y1=std::min(h-29,(int)std::ceil(std::max({a[1],b[1],c[1]})));
  int tex=(int)a[8];
  for(int y=y0;y<=y1;y++)for(int x=x0;x<=x1;x++){
   float u=((b[1]-c[1])*(x+.5f-c[0])+(c[0]-b[0])*(y+.5f-c[1]))/denom;
   float v=((c[1]-a[1])*(x+.5f-c[0])+(a[0]-c[0])*(y+.5f-c[1]))/denom,q=1-u-v;if(u<0||v<0||q<0)continue;
   float z=u*a[2]+v*b[2]+q*c[2];int p=y*w+x;if(z<=depth[p])continue;depth[p]=z;
   int offset=0;if(tex>=0){float U=u*a[6]+v*b[6]+q*c[6],V=u*a[7]+v*b[7]+q*c[7];int tx=(int)((U-std::floor(U))*textureSize),ty=(int)((1-(V-std::floor(V)))*textureSize)%textureSize;offset=((tex*textureSize+ty)*textureSize+tx)*3;}
   for(int k=0;k<3;k++){float value=u*a[k+3]+v*b[k+3]+q*c[k+3];if(tex>=0)value*=lut[textures[offset+k]];value=std::clamp(value,0.f,1.f);float out=value<=.0031308f?value*12.92f:1.055f*std::pow(value,1/2.4f)-.055f;rgb[p*3+k]=(unsigned char)(out*255.f);}
  }
 }
}
