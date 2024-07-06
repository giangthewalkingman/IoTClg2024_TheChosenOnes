#include <iostream>
#include <cmath>
#include <limits>

void pmv_ppd(
    const double& ta,
    const double& v,
    const double& rh,
    const double& met,
    const double& clo,
    double& pmv,
    double& ppd
) {
    double vr = (met > 1) ? std::round((v + 0.3 * (met - 1)) * 1000) / 1000.0 : v;
    double clo_d = (met > 1.2) ? std::round(clo * (0.6 + 0.4 / met) * 1000) / 1000.0 : clo;
    double pa = rh * 10 * std::exp(16.6536 - 4030.183 / (ta + 235));
    double icl = 0.155 * clo_d;
    double m = met * 58.15;
    double f_cl = (icl <= 0.078) ? (1 + 1.29 * icl) : (1.05 + 0.645 * icl);
    double hcf = 12.1 * std::sqrt(vr);
    double hc = hcf;
    double taa = ta + 273;
    double t_cla = taa + (35.5 - ta) / (3.5 * icl + 0.1);

    double p1 = icl * f_cl;
    double p2 = p1 * 3.96;
    double p3 = p1 * 100;
    double p4 = p1 * taa;
    double p5 = (308.7 - 0.028 * m) + (p2 * std::pow((taa / 100.0), 4));
    double xn = t_cla / 100;
    double xf = t_cla / 50;
    double eps = 0.00015;

    int n = 0;
    while (std::abs(xn - xf) > eps) {
        xf = (xf + xn) / 2;
        double hcn = 2.38 * std::pow(std::abs(100.0 * xf - taa), 0.25);
        hc = (hcf > hcn) ? hcf : hcn;
        xn = (p5 + p4 * hc - p2 * std::pow(xf, 4)) / (100 + p3 * hc);
        n += 1;
        if (n > 300) throw std::runtime_error("Max iterations exceeded");
    }

    double tcl = 100 * xn - 273;
    double hl1 = 3.05 * 0.001 * (5733 - (6.99 * m) - pa);
    double hl2 = (m > 58.15) ? (0.42 * (m - 58.15)) : 0;
    double hl3 = 1.7 * 0.00001 * m * (5867 - pa);
    double hl4 = 0.0014 * m * (34 - ta);
    double hl5 = 3.96 * f_cl * (std::pow(xn, 4) - std::pow((taa / 100.0), 4));
    double hl6 = f_cl * hc * (tcl - ta);

    double ts = 0.303 * std::exp(-0.036 * m) + 0.028;
    pmv = round(100 * ts * (m - hl1 - hl2 - hl3 - hl4 - hl5 - hl6)) / 100.0;
    ppd = round(10 * (100.0 - 95.0 * std::exp(-0.03353 * std::pow(pmv, 4.0) - 0.2179 * std::pow(pmv, 2.0)))) / 10;
}

int main() {
    double temp = 27;
    double humid = 53;
    double wind = 0.1;
    double met = 1.2;
    double clo = 0.67;
    double pmv = 0;
    double ppd = 0;

    // Calculate PMV and PPD
    pmv_ppd(temp, wind, humid, met, clo, pmv, ppd);

    std::cout << "PMV: " << pmv << std::endl;
    std::cout << "PPD: " << ppd << std::endl;

    return 0;
}
